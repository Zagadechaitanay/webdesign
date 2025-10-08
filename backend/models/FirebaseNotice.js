import { db } from '../lib/firebase.js';

class FirebaseNotice {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.content = data.content;
    this.type = data.type || 'general';
    this.priority = data.priority || 'medium';
    this.targetAudience = data.targetAudience || 'all';
    this.targetBranch = data.targetBranch || null;
    this.isPinned = data.isPinned || false;
    this.expiresAt = data.expiresAt || null;
    this.attachments = data.attachments || [];
    this.tags = data.tags || [];
    this.createdBy = data.createdBy || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Create a new notice
  static async create(noticeData) {
    try {
      const noticeRef = db.collection('notices').doc();
      const notice = {
        id: noticeRef.id,
        title: noticeData.title,
        content: noticeData.content,
        type: noticeData.type || 'general',
        priority: noticeData.priority || 'medium',
        targetAudience: noticeData.targetAudience || 'all',
        targetBranch: noticeData.targetBranch || null,
        isPinned: noticeData.isPinned || false,
        expiresAt: noticeData.expiresAt || null,
        attachments: noticeData.attachments || [],
        tags: noticeData.tags || [],
        createdBy: noticeData.createdBy || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await noticeRef.set(notice);
      return new FirebaseNotice(notice);
    } catch (error) {
      console.error('Error creating notice:', error);
      throw error;
    }
  }

  // Find notice by ID
  static async findById(id) {
    try {
      const noticeDoc = await db.collection('notices').doc(id).get();
      if (!noticeDoc.exists) {
        return null;
      }
      return new FirebaseNotice({ id: noticeDoc.id, ...noticeDoc.data() });
    } catch (error) {
      console.error('Error finding notice by ID:', error);
      throw error;
    }
  }

  // Find notices with filters
  static async find(query = {}) {
    try {
      let queryRef = db.collection('notices');
      
      // Apply filters
      for (const [field, value] of Object.entries(query)) {
        if (field !== 'id' && field !== 'sort') {
          queryRef = queryRef.where(field, '==', value);
        }
      }
      
      // Add ordering (pinned first, then by creation date)
      queryRef = queryRef.orderBy('isPinned', 'desc').orderBy('createdAt', 'desc');
      
      const snapshot = await queryRef.get();
      const notices = [];
      
      snapshot.forEach(doc => {
        notices.push(new FirebaseNotice({ id: doc.id, ...doc.data() }));
      });
      
      return notices;
    } catch (error) {
      console.error('Error finding notices:', error);
      throw error;
    }
  }

  // Find notices with sorting and limiting
  static async findWithOptions(query = {}, sortOptions = {}, limitCount = null) {
    try {
      let queryRef = db.collection('notices');
      
      // Apply filters
      for (const [field, value] of Object.entries(query)) {
        if (field !== 'id' && field !== 'sort') {
          queryRef = queryRef.where(field, '==', value);
        }
      }
      
      // Apply sorting
      if (sortOptions.createdAt) {
        queryRef = queryRef.orderBy('createdAt', sortOptions.createdAt);
      } else {
        // Default ordering (pinned first, then by creation date)
        queryRef = queryRef.orderBy('isPinned', 'desc').orderBy('createdAt', 'desc');
      }
      
      // Apply limit
      if (limitCount) {
        queryRef = queryRef.limit(limitCount);
      }
      
      const snapshot = await queryRef.get();
      const notices = [];
      
      snapshot.forEach(doc => {
        notices.push(new FirebaseNotice({ id: doc.id, ...doc.data() }));
      });
      
      return notices;
    } catch (error) {
      console.error('Error finding notices with options:', error);
      throw error;
    }
  }

  // Find public notices
  static async findPublic() {
    try {
      const snapshot = await db.collection('notices')
        .where('targetAudience', 'in', ['all', 'students'])
        .orderBy('isPinned', 'desc')
        .orderBy('createdAt', 'desc')
        .get();
      
      const notices = [];
      snapshot.forEach(doc => {
        notices.push(new FirebaseNotice({ id: doc.id, ...doc.data() }));
      });
      
      return notices;
    } catch (error) {
      console.error('Error finding public notices:', error);
      throw error;
    }
  }

  // Update notice
  async save() {
    try {
      this.updatedAt = new Date();
      await db.collection('notices').doc(this.id).update({
        ...this,
        id: undefined // Don't update the ID
      });
      return this;
    } catch (error) {
      console.error('Error saving notice:', error);
      throw error;
    }
  }

  // Update by ID
  static async findByIdAndUpdate(id, updates) {
    try {
      const noticeRef = db.collection('notices').doc(id);
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      await noticeRef.update(updateData);
      
      const updatedDoc = await noticeRef.get();
      if (!updatedDoc.exists) {
        return null;
      }
      
      return new FirebaseNotice({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
      console.error('Error updating notice:', error);
      throw error;
    }
  }

  // Delete notice
  async delete() {
    try {
      await db.collection('notices').doc(this.id).delete();
      return true;
    } catch (error) {
      console.error('Error deleting notice:', error);
      throw error;
    }
  }

  // Static method to delete by ID
  static async findByIdAndDelete(id) {
    try {
      const notice = await this.findById(id);
      if (notice) {
        await notice.delete();
        return notice;
      }
      return null;
    } catch (error) {
      console.error('Error deleting notice by ID:', error);
      throw error;
    }
  }
}

export default FirebaseNotice;
