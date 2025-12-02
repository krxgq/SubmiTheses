import { supabase } from "./supabase";
import type { User, Session, AuthError } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
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
  username: string;
  firstName?: string;
  lastName?: string;
  subscribeNewsletter?: boolean;
}

export interface AuthResponse<T = AuthUser> {
  data: T | null;
  error: string | null;
}

class AuthService {
  async login({
    email,
    password,
    rememberMe,
  }: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { data: null, error: this.getErrorMessage(error) };
      }

      if (data.user && data.session) {
        // Session is automatically stored in cookies by Supabase
        if (rememberMe) {
          localStorage.setItem("remember-me", "true");
        }

        const authUser = await this.mapSupabaseUser(data.user);
        return { data: authUser, error: null };
      }

      return { data: null, error: "Login failed" };
    } catch (err) {
      return { data: null, error: "Network error occurred" };
    }
  }

  async register({
    email,
    password,
    username,
  }: RegisterCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
        },
      });

      if (error) {
        return { data: null, error: this.getErrorMessage(error) };
      }

      if (data.user) {
        // Check if email confirmation is required
        if (!data.session) {
          return {
            data: null,
            error:
              "Please check your email and click the confirmation link to complete registration.",
          };
        }

        // Session is automatically stored in cookies by Supabase
        const authUser = await this.mapSupabaseUser(data.user);
        return { data: authUser, error: null };
      }

      return { data: null, error: "Registration failed" };
    } catch (err) {
      return { data: null, error: "Network error occurred" };
    }
  }

  async logout(): Promise<AuthResponse<null>> {
    try {
      const { error } = await supabase.auth.signOut();

      // Clear only non-session local storage
      localStorage.removeItem("remember-me");

      // Clear role cookie (will be removed on next server request)
      // The cookie is httpOnly so we can't delete it from client-side
      // It will be cleared by middleware on next page load

      if (error) {
        return { data: null, error: this.getErrorMessage(error) };
      }

      return { data: null, error: null };
    } catch (err) {
      return { data: null, error: "Logout failed" };
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      // Use getUser() for secure authentication validation
      // This validates against Supabase Auth server instead of just reading cookies
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      console.log("AuthService - getUser result:", { user: user ? "User exists" : "No user", error });

      if (error || !user) {
        return null;
      }

      const res = await this.mapSupabaseUser(user);
      console.log("AuthService - getCurrentUser mapped:", res);
      return res;
    } catch (err) {
      console.error("AuthService - getCurrentUser error:", err);
      return null;
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
      }
      return session;
    } catch (err) {
      return null;
    }
  }

  async refreshSession(): Promise<AuthResponse<AuthUser>> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        return { data: null, error: this.getErrorMessage(error) };
      }

      if (data.session && data.user) {
        // Session is automatically updated in cookies by Supabase
        const authUser = await this.mapSupabaseUser(data.user);
        return { data: authUser, error: null };
      }

      return { data: null, error: "Session refresh failed" };
    } catch (err) {
      return { data: null, error: "Network error occurred" };
    }
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Session is automatically managed in cookies by Supabase
        const authUser = await this.mapSupabaseUser(session.user);
        callback(authUser);
      } else {
        callback(null);
      }
    });
  }

  private async mapSupabaseUser(user: User): Promise<AuthUser> {
    // Role will come from JWT app_metadata (set by database trigger)
    // Still fetch other profile data from public.users table
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('full_name, avatar_url, email, year_id')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Failed to fetch user profile:', error);
    }

    // Get role from current session JWT
    let role = 'student'; // default
    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      if (accessToken) {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        role = payload.app_metadata?.role || payload.user_metadata?.role || 'student';
      }
    } catch (e) {
      console.warn('Could not extract role from JWT:', e);
    }

    return {
      id: user.id,
      email: user.email || "",
      full_name: userProfile?.full_name,
      avatar_url: userProfile?.avatar_url,
      role: role,
      year_id: userProfile?.year_id,
      created_at: user.created_at,
    };
  }

  private getErrorMessage(error: AuthError): string {
    switch (error.message) {
      case "Invalid login credentials":
        return "Invalid email or password. Please try again.";
      case "Email not confirmed":
        return "Please confirm your email address before signing in.";
      case "User already registered":
        return "An account with this email already exists.";
      case "Password should be at least 6 characters":
        return "Password must be at least 6 characters long.";
      case "Unable to validate email address: invalid format":
        return "Please enter a valid email address.";
      case "Signup is disabled":
        return "Account registration is currently disabled.";
      default:
        return error.message || "An unexpected error occurred.";
    }
  }
}

export const authService = new AuthService();
