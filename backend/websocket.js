import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { onChange, getMaintenance } from './lib/systemState.js';
import FirebaseUser from './models/FirebaseUser.js';

class NotificationService {
  constructor() {
    this.clients = new Map(); // userId -> WebSocket connection
    this.wss = null;
  }

  initialize(server) {
    this.wss = new WebSocketServer({ server });
    try {
      this.wss.on('error', (err) => {
        console.error('WebSocket server error:', err);
      });
    } catch {}
    
    this.wss.on('connection', (ws, req) => {
      console.log('New WebSocket connection established');
      
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          
          switch (message.type) {
            case 'authenticate':
              await this.handleAuthentication(ws, message.token);
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

    // Broadcast maintenance changes
    onChange((state) => {
      const payload = JSON.stringify({ type: 'maintenance', maintenance: state.maintenance });
      if (!this.wss) return;
      this.wss.clients.forEach((client) => {
        try { client.send(payload); } catch {}
      });
    });
  }

  async broadcastToAdmins(message) {
    try {
      const targetUsers = await this.getTargetUsers('admins');
      let sentCount = 0;
      for (const userId of targetUsers) {
        const client = this.clients.get(userId);
        if (client && client.readyState === 1) {
          try {
            client.send(JSON.stringify(message));
            sentCount++;
          } catch (error) {
            console.error(`Error sending to admin ${userId}:`, error);
            this.clients.delete(userId);
          }
        }
      }
      if (sentCount) {
        console.log(`Broadcasted admin message '${message.type}' to ${sentCount} admins`);
      }
    } catch (error) {
      console.error('Error broadcasting to admins:', error);
    }
  }

  async notifyUserCreated(user) {
    await this.broadcastToAdmins({ type: 'user_created', user: { id: user._id, name: user.name, email: user.email, userType: user.userType, branch: user.branch, semester: user.semester, createdAt: user.createdAt } });
  }

  async notifyUserUpdated(user) {
    await this.broadcastToAdmins({ type: 'user_updated', user: { id: user._id, name: user.name, email: user.email, userType: user.userType, branch: user.branch, semester: user.semester, updatedAt: user.updatedAt } });
  }

  async notifyUserDeleted(userId) {
    await this.broadcastToAdmins({ type: 'user_deleted', userId });
  }

  // Subject events to admins
  async notifySubjectCreated(subject) {
    await this.broadcastToAdmins({ type: 'subject_created', subject });
  }

  async notifySubjectUpdated(subject) {
    await this.broadcastToAdmins({ type: 'subject_updated', subject });
  }

  async notifySubjectDeleted(subjectId) {
    await this.broadcastToAdmins({ type: 'subject_deleted', subjectId });
  }

  // Materials events (optional if used on dashboard)
  async notifyMaterialUploaded(material) {
    await this.broadcastToAdmins({ type: 'material_uploaded', material });
  }

  async notifyNoticePublished(notice) {
    await this.broadcastToAdmins({ type: 'notice_published', notice });
  }

  async handleAuthentication(ws, token) {
    try {
      // Verify JWT and extract userId
      const getJWTSecret = () => {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
          throw new Error('JWT_SECRET environment variable is required');
        }
        return JWT_SECRET;
      };
      const decoded = jwt.verify(token, getJWTSecret());
      const userId = decoded.userId;

      // Verify user exists in Firebase (ids are strings, not ObjectIds)
      const user = await FirebaseUser.findById(userId);
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

      const users = await FirebaseUser.find(query);
      return users
        .map(u => (u.id || u._id)?.toString())
        .filter(Boolean);
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
