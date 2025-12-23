import { apiRequest, API_BASE_URL } from './api/client';

export interface AuthUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role?: string;
  year_id?: number;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  subscribeNewsletter?: boolean;
}

export interface AuthResponse<T = AuthUser> {
  data: T | null;
  error: string | null;
}

// BroadcastChannel for cross-tab communication (NO Supabase dependency)
let authChannel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  authChannel = new BroadcastChannel('auth-state');
}

function broadcastAuthEvent(event: 'login' | 'logout', user: AuthUser | null) {
  if (authChannel) {
    authChannel.postMessage({ event, user, timestamp: Date.now() });
  }
}

class AuthService {
  async login({
    email,
    password,
    rememberMe,
  }: LoginCredentials): Promise<AuthResponse> {
    try {
      const data = await apiRequest<{ user: AuthUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.user) {
        if (rememberMe) {
          localStorage.setItem('remember-me', 'true');
        }
        broadcastAuthEvent('login', data.user);
        return { data: data.user, error: null };
      }

      return { data: null, error: 'Login failed' };
    } catch (err: any) {
      return { data: null, error: err.message || 'Network error occurred' };
    }
  }

  async register({
    email,
    password,
    firstName,
    lastName,
  }: RegisterCredentials): Promise<AuthResponse> {
    try {
      const data = await apiRequest<{
        user: AuthUser | null;
        message?: string;
      }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      // Registration successful with immediate login
      if (data.user) {
        broadcastAuthEvent('login', data.user);
        return { data: data.user, error: null };
      }

      return { data: null, error: 'Registration failed' };
    } catch (err: any) {
      return { data: null, error: err.message || 'Network error occurred' };
    }
  }

  async logout(): Promise<AuthResponse<null>> {
    try {
      await apiRequest<void>('/auth/logout', { method: 'POST' });
      localStorage.removeItem('remember-me');
      
      // Clear any draft data on logout
      sessionStorage.removeItem('create-project-draft');
      
      broadcastAuthEvent('logout', null);
      return { data: null, error: null };
    } catch (err: any) {
      // Even if backend fails, clear local state
      localStorage.removeItem('remember-me');
      sessionStorage.removeItem('create-project-draft');
      broadcastAuthEvent('logout', null);
      return { data: null, error: 'Logout failed' };
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const user = await apiRequest<AuthUser>('/auth/user');
      return user;
    } catch (err) {
      return null;
    }
  }

  async refreshSession(): Promise<void> {
    try {
      await apiRequest<void>('/auth/refresh', { method: 'POST' });
    } catch (err) {
      console.error('Session refresh failed:', err);
    }
  }

  /**
   * Listen for auth state changes across tabs
   * @param callback - Function to call when auth state changes
   * @returns Cleanup function
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    if (!authChannel) {
      return () => {};
    }

    const handler = (event: MessageEvent) => {
      const { event: authEvent, user } = event.data;
      if (authEvent === 'login' || authEvent === 'logout') {
        callback(user);
      }
    };

    authChannel.addEventListener('message', handler);

    return () => {
      authChannel?.removeEventListener('message', handler);
    };
  }
}

export const authService = new AuthService();
