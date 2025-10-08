import { db, isFirebaseReady } from '../lib/firebase.js';

class FirebaseSubject {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.code = data.code;
    this.branch = data.branch;
    this.semester = data.semester;
    this.credits = data.credits || 4;
    this.hours = data.hours || 60;
    this.type = data.type || 'Theory';
    this.description = data.description || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Create a new subject
  static async create(subjectData) {
    try {
      const subjectRef = db.collection('subjects').doc();
      const subject = {
        id: subjectRef.id,
        name: subjectData.name,
        code: subjectData.code,
        branch: subjectData.branch,
        semester: parseInt(subjectData.semester),
        credits: subjectData.credits || 4,
        hours: subjectData.hours || 60,
        type: subjectData.type || 'Theory',
        description: subjectData.description || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await subjectRef.set(subject);
      return new FirebaseSubject(subject);
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
  }

  // Find subject by ID
  static async findById(id) {
    try {
      const subjectDoc = await db.collection('subjects').doc(id).get();
      if (!subjectDoc.exists) {
        return null;
      }
      return new FirebaseSubject({ id: subjectDoc.id, ...subjectDoc.data() });
    } catch (error) {
      console.error('Error finding subject by ID:', error);
      throw error;
    }
  }

  // Find subjects with filters
  static async find(query = {}) {
    // If Firebase is not ready, return empty array for now
    if (!isFirebaseReady) {
      console.log('Firebase not ready, returning empty subjects array');
      return [];
    }

    try {
      let queryRef = db.collection('subjects');
      
      // Apply filters
      for (const [field, value] of Object.entries(query)) {
        if (field !== 'id') {
          queryRef = queryRef.where(field, '==', value);
        }
      }
      
      // Add ordering
      queryRef = queryRef.orderBy('semester', 'asc').orderBy('name', 'asc');
      
      const snapshot = await queryRef.get();
      const subjects = [];
      
      snapshot.forEach(doc => {
        subjects.push(new FirebaseSubject({ id: doc.id, ...doc.data() }));
      });
      
      return subjects;
    } catch (error) {
      console.error('Error finding subjects:', error);
      return [];
    }
  }

  // Get distinct branches
  static async distinct(field) {
    // If Firebase is not ready, return empty array for now
    if (!isFirebaseReady) {
      console.log('Firebase not ready, returning empty branches array');
      return [];
    }

    try {
      const snapshot = await db.collection('subjects').get();
      const values = new Set();
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data[field] !== undefined) {
          values.add(data[field]);
        }
      });
      
      return Array.from(values);
    } catch (error) {
      console.error('Error getting distinct values:', error);
      return [];
    }
  }

  // Update subject
  async save() {
    try {
      this.updatedAt = new Date();
      await db.collection('subjects').doc(this.id).update({
        ...this,
        id: undefined // Don't update the ID
      });
      return this;
    } catch (error) {
      console.error('Error saving subject:', error);
      throw error;
    }
  }

  // Update by ID
  static async findByIdAndUpdate(id, updates) {
    try {
      const subjectRef = db.collection('subjects').doc(id);
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      await subjectRef.update(updateData);
      
      const updatedDoc = await subjectRef.get();
      if (!updatedDoc.exists) {
        return null;
      }
      
      return new FirebaseSubject({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
  }

  // Delete subject
  async delete() {
    try {
      await db.collection('subjects').doc(this.id).delete();
      return true;
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  }

  // Static method to delete by ID
  static async findByIdAndDelete(id) {
    try {
      const subject = await this.findById(id);
      if (subject) {
        await subject.delete();
        return subject;
      }
      return null;
    } catch (error) {
      console.error('Error deleting subject by ID:', error);
      throw error;
    }
  }
}

export default FirebaseSubject;
