// User Management System
export interface User {
  id: string;
  name: string;
  email: string;
  studentId?: string;
  userType: 'student' | 'admin';
  selectedBranch?: string;
  selectedSemester?: number;
  createdAt: Date;
  lastLogin: Date;
  password?: string; // <-- add this line
}

class UserManagement {
  private users: User[] = [];
  private currentUser: User | null = null;

  // Initialize with some demo users
  constructor() {
    this.loadUsers();
  }

  private loadUsers() {
    // Load from localStorage if available
    const storedUsers = localStorage.getItem('digi-gurukul-users');
    if (storedUsers) {
      this.users = JSON.parse(storedUsers);
    } else {
      // Create demo users
      this.users = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@student.com',
          studentId: 'STU001',
          userType: 'student',
          selectedBranch: 'Computer Engineering',
          selectedSemester: 2,
          createdAt: new Date('2024-01-01'),
          lastLogin: new Date(),
          password: 'student123', // optional for demo
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@student.com',
          studentId: 'STU002',
          userType: 'student',
          selectedBranch: 'Electronics & Telecommunication',
          selectedSemester: 3,
          createdAt: new Date('2024-01-15'),
          lastLogin: new Date(),
          password: 'student123', // optional for demo
        },
        {
          id: 'admin1',
          name: 'Admin User',
          email: 'admin@digigurukul.com',
          userType: 'admin',
          createdAt: new Date('2024-01-01'),
          lastLogin: new Date(),
          password: 'admin123', // <-- set default admin password
        }
      ];
      this.saveUsers();
    }
  }

  private saveUsers() {
    localStorage.setItem('digi-gurukul-users', JSON.stringify(this.users));
  }

  // Login user
  login(email: string, password: string, userType: 'student' | 'admin'): User | null {
    // Find user by email and userType
    const user = this.users.find(u => u.email === email && u.userType === userType);
    if (user) {
      // For admin, check password
      if (user.userType === 'admin') {
        if (user.password !== password) {
          return null;
        }
      }
      user.lastLogin = new Date();
      this.currentUser = user;
      this.saveUsers();
      return user;
    }
    return null;
  }

  // Create new user account
  createUser(userData: {
    name: string;
    email: string;
    studentId: string;
    password: string;
    branch: string;
    semester: string;
  }): User {
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      studentId: userData.studentId,
      userType: 'student',
      selectedBranch: userData.branch,
      selectedSemester: parseInt(userData.semester),
      createdAt: new Date(),
      lastLogin: new Date()
    };

    this.users.push(newUser);
    this.currentUser = newUser;
    this.saveUsers();
    return newUser;
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Update user's selected branch
  updateUserBranch(branch: string) {
    if (this.currentUser) {
      this.currentUser.selectedBranch = branch;
      this.saveUsers();
    }
  }

  // Update user's selected semester
  updateUserSemester(semester: number) {
    if (this.currentUser) {
      this.currentUser.selectedSemester = semester;
      this.saveUsers();
    }
  }

  // Logout user
  logout() {
    this.currentUser = null;
  }

  // Get all users (for admin)
  getAllUsers(): User[] {
    return this.users;
  }

  // Delete user (for admin)
  deleteUser(userId: string): boolean {
    const index = this.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      this.users.splice(index, 1);
      this.saveUsers();
      return true;
    }
    return false;
  }

  // Update user (for admin)
  updateUser(userId: string, updates: Partial<User>): boolean {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      Object.assign(user, updates);
      this.saveUsers();
      return true;
    }
    return false;
  }

  // Check if user exists
  userExists(email: string, userType: 'student' | 'admin'): boolean {
    return this.users.some(u => u.email === email && u.userType === userType);
  }
}

// Export singleton instance
export const userManagement = new UserManagement(); 