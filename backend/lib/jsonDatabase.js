import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class JsonDatabase {
  constructor() {
    this.dbPath = path.join(__dirname, '..', 'database');
    this.usersFile = path.join(this.dbPath, 'users.json');
    this.noticesFile = path.join(this.dbPath, 'notices.json');
    this.materialsFile = path.join(this.dbPath, 'materials.json');
  }

  async ensureDirectory() {
    try {
      await fs.access(this.dbPath);
    } catch {
      await fs.mkdir(this.dbPath, { recursive: true });
    }
  }

  async readUsers() {
    try {
      const data = await fs.readFile(this.usersFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async writeUsers(users) {
    await this.ensureDirectory();
    await fs.writeFile(this.usersFile, JSON.stringify(users, null, 2));
  }

  async readNotices() {
    try {
      const data = await fs.readFile(this.noticesFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async writeNotices(notices) {
    await this.ensureDirectory();
    await fs.writeFile(this.noticesFile, JSON.stringify(notices, null, 2));
  }

  // Materials
  async readMaterials() {
    try {
      const data = await fs.readFile(this.materialsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async writeMaterials(materials) {
    await this.ensureDirectory();
    await fs.writeFile(this.materialsFile, JSON.stringify(materials, null, 2));
  }

  async createMaterial(materialData) {
    const materials = await this.readMaterials();
    const newMaterial = {
      _id: this.generateId(),
      downloads: 0,
      rating: 0,
      createdAt: new Date().toISOString(),
      ...materialData,
    };
    materials.unshift(newMaterial);
    await this.writeMaterials(materials);
    return newMaterial;
  }

  async findMaterials(query = {}) {
    const materials = await this.readMaterials();
    if (Object.keys(query).length === 0) return materials;
    return materials.filter(m => Object.entries(query).every(([k, v]) => m[k] === v));
  }

  async updateMaterial(id, updates) {
    const materials = await this.readMaterials();
    const index = materials.findIndex(m => m._id === id);
    if (index === -1) return null;
    materials[index] = { ...materials[index], ...updates, updatedAt: new Date().toISOString() };
    await this.writeMaterials(materials);
    return materials[index];
  }

  async deleteMaterial(id) {
    const materials = await this.readMaterials();
    const filtered = materials.filter(m => m._id !== id);
    await this.writeMaterials(filtered);
    return filtered.length < materials.length;
  }

  // User operations
  async findUserById(id) {
    const users = await this.readUsers();
    return users.find(user => user._id === id);
  }

  async findUserByEmail(email) {
    const users = await this.readUsers();
    return users.find(user => user.email === email);
  }

  async findUsers(query = {}) {
    const users = await this.readUsers();
    if (Object.keys(query).length === 0) return users;
    
    return users.filter(user => {
      return Object.entries(query).every(([key, value]) => user[key] === value);
    });
  }

  async createUser(userData) {
    const users = await this.readUsers();
    const newUser = {
      _id: this.generateId(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    await this.writeUsers(users);
    return newUser;
  }

  async updateUser(id, updateData) {
    const users = await this.readUsers();
    const index = users.findIndex(user => user._id === id);
    if (index === -1) return null;
    
    users[index] = { ...users[index], ...updateData };
    await this.writeUsers(users);
    return users[index];
  }

  async deleteUser(id) {
    const users = await this.readUsers();
    const filteredUsers = users.filter(user => user._id !== id);
    await this.writeUsers(filteredUsers);
    return filteredUsers.length < users.length;
  }

  // Notice operations
  async findNoticeById(id) {
    const notices = await this.readNotices();
    return notices.find(notice => notice._id === id);
  }

  async findNotices(query = {}) {
    const notices = await this.readNotices();
    if (Object.keys(query).length === 0) return notices;
    
    return notices.filter(notice => {
      return Object.entries(query).every(([key, value]) => notice[key] === value);
    });
  }

  async createNotice(noticeData) {
    const notices = await this.readNotices();
    const newNotice = {
      _id: this.generateId(),
      ...noticeData,
      createdAt: new Date().toISOString()
    };
    notices.unshift(newNotice); // Add to beginning
    await this.writeNotices(notices);
    return newNotice;
  }

  async updateNotice(id, updateData) {
    const notices = await this.readNotices();
    const index = notices.findIndex(notice => notice._id === id);
    if (index === -1) return null;
    
    notices[index] = { ...notices[index], ...updateData, updatedAt: new Date().toISOString() };
    await this.writeNotices(notices);
    return notices[index];
  }

  async deleteNotice(id) {
    const notices = await this.readNotices();
    const filteredNotices = notices.filter(notice => notice._id !== id);
    await this.writeNotices(filteredNotices);
    return filteredNotices.length < notices.length;
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}

export default new JsonDatabase();
