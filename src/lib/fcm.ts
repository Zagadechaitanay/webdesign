import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../backend/firebase-config.js';

// Initialize Firebase app for FCM
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// VAPID key for FCM (you'll need to generate this in Firebase Console)
const VAPID_KEY = 'YOUR_VAPID_KEY_HERE';

export class FCMService {
  private static instance: FCMService;
  private token: string | null = null;

  private constructor() {}

  public static getInstance(): FCMService {
    if (!FCMService.instance) {
      FCMService.instance = new FCMService();
    }
    return FCMService.instance;
  }

  // Request notification permission and get FCM token
  public async requestPermission(): Promise<string | null> {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        
        // Get FCM token
        this.token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
        });
        
        if (this.token) {
          console.log('FCM Token:', this.token);
          // Send token to backend for storage
          await this.sendTokenToServer(this.token);
          return this.token;
        } else {
          console.log('No registration token available.');
          return null;
        }
      } else {
        console.log('Unable to get permission to notify.');
        return null;
      }
    } catch (error) {
      console.error('An error occurred while retrieving token:', error);
      return null;
    }
  }

  // Send FCM token to backend
  private async sendTokenToServer(token: string): Promise<void> {
    try {
      const response = await fetch('/api/notifications/register-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        throw new Error('Failed to register FCM token');
      }

      console.log('FCM token registered successfully');
    } catch (error) {
      console.error('Error registering FCM token:', error);
    }
  }

  // Listen for foreground messages
  public onMessage(callback: (payload: any) => void): void {
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      callback(payload);
    });
  }

  // Get current token
  public getToken(): string | null {
    return this.token;
  }

  // Subscribe to topic
  public async subscribeToTopic(topic: string): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ topic })
      });

      return response.ok;
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      return false;
    }
  }

  // Unsubscribe from topic
  public async unsubscribeFromTopic(topic: string): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ topic })
      });

      return response.ok;
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      return false;
    }
  }
}

// Export singleton instance
export const fcmService = FCMService.getInstance();
