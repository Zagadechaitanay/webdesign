import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import stripeService from '../services/stripeService.js';
import FirebaseUser from '../models/FirebaseUser.js';
import FirebaseSubscription from '../models/FirebaseSubscription.js';

const router = express.Router();

// Get subscription plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await stripeService.getSubscriptionPlans();
    res.json(plans);
  } catch (error) {
    console.error('Error getting subscription plans:', error);
    res.status(500).json({ error: 'Failed to get subscription plans' });
  }
});

// Create customer
router.post('/create-customer', authenticateToken, async (req, res) => {
  try {
    const user = await FirebaseUser.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const customer = await stripeService.createCustomer(user);
    
    // Update user with Stripe customer ID
    await FirebaseUser.findByIdAndUpdate(req.user.userId, {
      stripeCustomerId: customer.id
    });

    res.json({ customerId: customer.id });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Create checkout session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;
    
    if (!priceId || !successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'priceId, successUrl, and cancelUrl are required' });
    }

    const user = await FirebaseUser.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let customerId = user.stripeCustomerId;
    
    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripeService.createCustomer(user);
      customerId = customer.id;
      await FirebaseUser.findByIdAndUpdate(req.user.userId, {
        stripeCustomerId: customerId
      });
    }

    const session = await stripeService.createCheckoutSession(
      customerId,
      priceId,
      successUrl,
      cancelUrl,
      {
        userId: req.user.userId,
        userType: user.userType
      }
    );

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create portal session
router.post('/create-portal-session', authenticateToken, async (req, res) => {
  try {
    const { returnUrl } = req.body;
    
    if (!returnUrl) {
      return res.status(400).json({ error: 'returnUrl is required' });
    }

    const user = await FirebaseUser.findById(req.user.userId);
    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const session = await stripeService.createPortalSession(
      user.stripeCustomerId,
      returnUrl
    );

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// Get customer subscriptions
router.get('/subscriptions', authenticateToken, async (req, res) => {
  try {
    const user = await FirebaseUser.findById(req.user.userId);
    if (!user || !user.stripeCustomerId) {
      return res.json([]);
    }

    const subscriptions = await stripeService.stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'all',
    });

    res.json(subscriptions.data);
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    res.status(500).json({ error: 'Failed to get subscriptions' });
  }
});

// Cancel subscription
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    
    if (!subscriptionId) {
      return res.status(400).json({ error: 'subscriptionId is required' });
    }

    const subscription = await stripeService.cancelSubscription(subscriptionId);
    
    // Update local subscription record
    await FirebaseSubscription.updateByStripeId(subscriptionId, {
      status: 'cancelled',
      cancelledAt: new Date()
    });

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Webhook endpoint for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripeService.verifyWebhookSignature(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook event:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Webhook event handlers
async function handleCheckoutSessionCompleted(session) {
  try {
    const userId = session.metadata.userId;
    const subscriptionId = session.subscription;

    if (userId && subscriptionId) {
      // Update user's subscription status
      await FirebaseUser.findByIdAndUpdate(userId, {
        hasActiveSubscription: true,
        subscriptionId: subscriptionId
      });
    }
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

async function handleSubscriptionCreated(subscription) {
  try {
    const customerId = subscription.customer;
    const user = await FirebaseUser.findOne({ stripeCustomerId: customerId });
    
    if (user) {
      // Create local subscription record
      await FirebaseSubscription.create({
        userId: user.id,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerId,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        priceId: subscription.items.data[0].price.id,
        createdAt: new Date()
      });

      // Update user subscription status
      await FirebaseUser.findByIdAndUpdate(user.id, {
        hasActiveSubscription: true,
        subscriptionId: subscription.id
      });
    }
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  try {
    await FirebaseSubscription.updateByStripeId(subscription.id, {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    });
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  try {
    await FirebaseSubscription.updateByStripeId(subscription.id, {
      status: 'cancelled',
      cancelledAt: new Date()
    });

    // Update user subscription status
    const user = await FirebaseUser.findOne({ subscriptionId: subscription.id });
    if (user) {
      await FirebaseUser.findByIdAndUpdate(user.id, {
        hasActiveSubscription: false,
        subscriptionId: null
      });
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handlePaymentSucceeded(invoice) {
  try {
    const subscriptionId = invoice.subscription;
    if (subscriptionId) {
      await FirebaseSubscription.updateByStripeId(subscriptionId, {
        lastPaymentDate: new Date(),
        status: 'active'
      });
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(invoice) {
  try {
    const subscriptionId = invoice.subscription;
    if (subscriptionId) {
      await FirebaseSubscription.updateByStripeId(subscriptionId, {
        status: 'past_due',
        lastPaymentFailed: new Date()
      });
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

export default router;
