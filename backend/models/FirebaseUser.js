import { db, isFirebaseReady } from '../lib/firebase.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

class FirebaseUser {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.college = data.college;
    this.studentId = data.studentId;
    this.branch = data.branch;
    this.semester = data.semester;
    this.userType = data.userType || 'student';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Create a new user
  static async create(userData) {
    try {
      const now = new Date();
      if (!isFirebaseReady) {
        const user = {
          id: await this._generateId(),
          name: userData.name,
          email: userData.email,
          password: userData.password,
          college: userData.college,
          studentId: userData.studentId,
          branch: userData.branch,
          semester: userData.semester || null,
          userType: userData.userType || 'student',
          createdAt: now,
          updatedAt: now
        };
        await this._jsonInsert(user);
        return new FirebaseUser(user);
      }

      const userRef = db.collection('users').doc();
      const user = {
        id: userRef.id,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        college: userData.college,
        studentId: userData.studentId,
        branch: userData.branch,
        semester: userData.semester || null,
        userType: userData.userType || 'student',
        createdAt: now,
        updatedAt: now
      };
      await userRef.set(user);
      return new FirebaseUser(user);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      if (!isFirebaseReady) {
        const all = await this._jsonAll();
        const found = all.find(u => u.id === id);
        return found ? new FirebaseUser(found) : null;
      }
      const userDoc = await db.collection('users').doc(id).get();
      if (!userDoc.exists) return null;
      return new FirebaseUser({ id: userDoc.id, ...userDoc.data() });
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  // Find user by email or studentId
  static async findOne(query) {
    try {
      if (!isFirebaseReady) {
        const all = await this._jsonAll();
        if (query.$or) {
          const email = query.$or[0]?.email;
          const studentId = query.$or[1]?.studentId;
          const byEmail = email ? all.find(u => u.email === email) : null;
          if (byEmail) return new FirebaseUser(byEmail);
          const byStudentId = studentId ? all.find(u => u.studentId === studentId) : null;
          return byStudentId ? new FirebaseUser(byStudentId) : null;
        }
        const entries = Object.entries(query);
        const found = all.find(u => entries.every(([k, v]) => u[k] === v));
        return found ? new FirebaseUser(found) : null;
      }

      let queryRef = db.collection('users');
      
      if (query.$or) {
        // Handle $or queries (email or studentId)
        const emailQuery = queryRef.where('email', '==', query.$or[0].email);
        const studentIdQuery = queryRef.where('studentId', '==', query.$or[1].studentId);
        
        const [emailSnapshot, studentIdSnapshot] = await Promise.all([
          emailQuery.get(),
          studentIdQuery.get()
        ]);
        
        if (!emailSnapshot.empty) {
          const doc = emailSnapshot.docs[0];
          return new FirebaseUser({ id: doc.id, ...doc.data() });
        }
        
        if (!studentIdSnapshot.empty) {
          const doc = studentIdSnapshot.docs[0];
          return new FirebaseUser({ id: doc.id, ...doc.data() });
        }
        
        return null;
      }
      
      // Handle other query types
      for (const [field, value] of Object.entries(query)) {
        queryRef = queryRef.where(field, '==', value);
      }
      
      const snapshot = await queryRef.get();
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return new FirebaseUser({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  }

  // Find all users
  static async find(query = {}) {
    try {
      if (!isFirebaseReady) {
        const all = await this._jsonAll();
        const entries = Object.entries(query);
        const filtered = entries.length ? all.filter(u => entries.every(([k, v]) => u[k] === v)) : all;
        return filtered.map(u => new FirebaseUser(u));
      }

      let queryRef = db.collection('users');
      for (const [field, value] of Object.entries(query)) {
        if (field !== 'id') queryRef = queryRef.where(field, '==', value);
      }
      const snapshot = await queryRef.get();
      const users = [];
      snapshot.forEach(doc => { users.push(new FirebaseUser({ id: doc.id, ...doc.data() })); });
      return users;
    } catch (error) {
      console.error('Error finding users:', error);
      return [];
    }
  }

  // Update user
  async save() {
    try {
      this.updatedAt = new Date();
      if (!isFirebaseReady) {
        await FirebaseUser._jsonUpdate(this.id, this);
        return this;
      }
      await db.collection('users').doc(this.id).update({
        ...this,
        id: undefined
      });
      return this;
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  // Delete user
  async delete() {
    try {
      if (!isFirebaseReady) {
        await FirebaseUser._jsonDelete(this.id);
        return true;
      }
      await db.collection('users').doc(this.id).delete();
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Static method to delete by ID
  static async findByIdAndDelete(id) {
    try {
      const user = await this.findById(id);
      if (user) {
        await user.delete();
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error deleting user by ID:', error);
      throw error;
    }
  }

  // Hash password
  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  // Compare password
  async comparePassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  // Convert to JSON (exclude password)
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }

  // -------- Local JSON fallback helpers --------
  static async _dbFile() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const dbDir = path.join(__dirname, '..', 'database');
    const usersFile = path.join(dbDir, 'users.json');
    try { await fs.mkdir(dbDir, { recursive: true }); } catch {}
    return usersFile;
  }

  static async _jsonAll() {
    const file = await this._dbFile();
    try {
      const raw = await fs.readFile(file, 'utf8');
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  static async _jsonWrite(all) {
    const file = await this._dbFile();
    await fs.writeFile(file, JSON.stringify(all, null, 2));
  }

  static async _jsonInsert(user) {
    const all = await this._jsonAll();
    all.push({ ...user, createdAt: user.createdAt, updatedAt: user.updatedAt });
    await this._jsonWrite(all);
  }

  static async _jsonUpdate(id, patch) {
    const all = await this._jsonAll();
    const idx = all.findIndex(u => u.id === id);
    if (idx === -1) return;
    all[idx] = { ...all[idx], ...patch, id };
    await this._jsonWrite(all);
  }

  static async _jsonDelete(id) {
    const all = await this._jsonAll();
    const filtered = all.filter(u => u.id !== id);
    await this._jsonWrite(filtered);
  }

  static async _generateId() {
    return 'usr_' + Math.random().toString(36).slice(2, 10);
  }
}

export default FirebaseUser;
