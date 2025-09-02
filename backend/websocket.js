import { WebSocketServer } from 'ws';
import Notice from './models/Notice.js';
import User from './models/User.js';

class NotificationService {
  constructor() {
    this.clients = new Map(); // userId -> WebSocket connection
    this.wss = null;
  }

  initialize(server) {
    this.wss = new WebSocketServer({ server });
    
    this.wss.on('connection', (ws, req) => {
      console.log('New WebSocket connection established');
      
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          
          switch (message.type) {
            case 'authenticate':
              await this.handleAuthentication(ws, message.userId);
              break;
            case 'ping':
              ws.send(JSON.stringify({ type: 'pong' }));
              break;
            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.removeClient(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.removeClient(ws);
      });
    });

    console.log('WebSocket server initialized');
  }

  async handleAuthentication(ws, userId) {
    try {
      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'User not found' 
        }));
        ws.close();
        return;
      }

      // Store the connection
      this.clients.set(userId, ws);
      ws.userId = userId;

      // Send confirmation
      ws.send(JSON.stringify({ 
        type: 'authenticated', 
        userId: userId 
      }));

      console.log(`User ${userId} authenticated for notifications`);
    } catch (error) {
      console.error('Authentication error:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Authentication failed' 
      }));
      ws.close();
    }
  }

  removeClient(ws) {
    if (ws.userId) {
      this.clients.delete(ws.userId);
      console.log(`Removed client for user ${ws.userId}`);
    }
  }

  async broadcastNotice(notice) {
    try {
      // Get all users who should receive this notice
      const targetUsers = await this.getTargetUsers(notice);
      
      const notification = {
        type: 'new_notice',
        notice: {
          _id: notice._id,
          title: notice.title,
          content: notice.content,
          type: notice.type,
          priority: notice.priority,
          targetAudience: notice.targetAudience,
          targetBranch: notice.targetBranch,
          isPinned: notice.isPinned,
          createdAt: notice.createdAt,
          createdBy: notice.createdBy
        }
      };

      // Send to all target users who are connected
      let sentCount = 0;
      for (const userId of targetUsers) {
        const client = this.clients.get(userId);
        if (client && client.readyState === 1) { // WebSocket.OPEN
          try {
            client.send(JSON.stringify(notification));
            sentCount++;
          } catch (error) {
            console.error(`Error sending notification to user ${userId}:`, error);
            this.clients.delete(userId);
          }
        }
      }

      console.log(`Broadcasted notice to ${sentCount} connected users out of ${targetUsers.length} target users`);
    } catch (error) {
      console.error('Error broadcasting notice:', error);
    }
  }

  async getTargetUsers(notice) {
    try {
      let query = {};
      
      switch (notice.targetAudience) {
        case 'all':
          query = {};
          break;
        case 'students':
          query = { userType: 'student' };
          break;
        case 'admins':
          query = { userType: 'admin' };
          break;
        case 'specific_branch':
          query = { branch: notice.targetBranch };
          break;
        default:
          query = {};
      }

      const users = await User.find(query).select('_id');
      return users.map(user => user._id.toString());
    } catch (error) {
      console.error('Error getting target users:', error);
      return [];
    }
  }

  async updateNotice(notice) {
    try {
      const targetUsers = await this.getTargetUsers(notice);
      
      const notification = {
        type: 'notice_updated',
        notice: {
          _id: notice._id,
          title: notice.title,
          content: notice.content,
          type: notice.type,
          priority: notice.priority,
          targetAudience: notice.targetAudience,
          targetBranch: notice.targetBranch,
          isPinned: notice.isPinned,
          isActive: notice.isActive,
          updatedAt: notice.updatedAt
        }
      };

      let sentCount = 0;
      for (const userId of targetUsers) {
        const client = this.clients.get(userId);
        if (client && client.readyState === 1) {
          try {
            client.send(JSON.stringify(notification));
            sentCount++;
          } catch (error) {
            console.error(`Error sending update to user ${userId}:`, error);
            this.clients.delete(userId);
          }
        }
      }

      console.log(`Updated notice to ${sentCount} connected users`);
    } catch (error) {
      console.error('Error updating notice:', error);
    }
  }

  async deleteNotice(noticeId) {
    try {
      const notification = {
        type: 'notice_deleted',
        noticeId: noticeId
      };

      let sentCount = 0;
      for (const [userId, client] of this.clients) {
        if (client.readyState === 1) {
          try {
            client.send(JSON.stringify(notification));
            sentCount++;
          } catch (error) {
            console.error(`Error sending deletion to user ${userId}:`, error);
            this.clients.delete(userId);
          }
        }
      }

      console.log(`Notified ${sentCount} users about notice deletion`);
    } catch (error) {
      console.error('Error notifying about notice deletion:', error);
    }
  }

  getConnectedUsersCount() {
    return this.clients.size;
  }

  getConnectedUserIds() {
    return Array.from(this.clients.keys());
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
