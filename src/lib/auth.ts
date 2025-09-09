export interface AuthUser {
  id: string;
  name: string;
  email: string;
  userType: 'student' | 'admin';
  branch?: string;
  semester?: string;
  studentId?: string;
}

export interface LoginCredentials {
  emailOrStudentId: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  studentId: string;
  password: string;
  branch: string;
  semester: string;
  college: string;
}

class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  // Login user
  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string } | null> {
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Store token and user data
      this.setToken(data.token);
      this.setUser(data.user);
      
      return { user: data.user, token: data.token };
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  // Register user
  async register(credentials: RegisterCredentials): Promise<{ user: AuthUser; token: string } | null> {
    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      
      // Store token and user data
      this.setToken(data.token);
      this.setUser(data.user);
      
      return { user: data.user, token: data.token };
    } catch (error) {
      console.error('Registration error:', error);
      return null;
    }
  }

  // Logout user
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    const userStr = localStorage.getItem(this.userKey);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Get token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Simple token validation - check if it exists and is not empty
      return token.length > 0;
    } catch {
      this.logout();
      return false;
    }
  }

  // Set token
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Set user
  private setUser(user: AuthUser): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Get auth headers for API requests
  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Refresh token
  async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch('/api/users/refresh', {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        this.logout();
        return false;
      }

      const data = await response.json();
      this.setToken(data.token);
      return true;
    } catch {
      this.logout();
      return false;
    }
  }
}

export const authService = new AuthService();
