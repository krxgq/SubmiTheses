import { supabase } from './supabase'
import type { User, Session, AuthError } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  username?: string
  created_at: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterCredentials {
  email: string
  password: string
  username: string
  firstName?: string
  lastName?: string
  subscribeNewsletter?: boolean
}

export interface AuthResponse<T = AuthUser> {
  data: T | null
  error: string | null
}

class AuthService {
  async login({ email, password, rememberMe }: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { data: null, error: this.getErrorMessage(error) }
      }

      if (data.user && data.session) {
        // Store session token in localStorage for API compatibility
        localStorage.setItem('auth-token', data.session.access_token)
        localStorage.setItem('refresh-token', data.session.refresh_token)

        if (rememberMe) {
          localStorage.setItem('remember-me', 'true')
        }

        const authUser = this.mapSupabaseUser(data.user)
        return { data: authUser, error: null }
      }

      return { data: null, error: 'Login failed' }
    } catch (err) {
      return { data: null, error: 'Network error occurred' }
    }
  }

  async register({ email, password, username }: RegisterCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
        },
      })

      if (error) {
        return { data: null, error: this.getErrorMessage(error) }
      }

      if (data.user) {
        // Check if email confirmation is required
        if (!data.session) {
          return {
            data: null,
            error: 'Please check your email and click the confirmation link to complete registration.',
          }
        }

        // Auto-login after successful registration
        if (data.session) {
          localStorage.setItem('auth-token', data.session.access_token)
          localStorage.setItem('refresh-token', data.session.refresh_token)
        }

        const authUser = this.mapSupabaseUser(data.user)
        return { data: authUser, error: null }
      }

      return { data: null, error: 'Registration failed' }
    } catch (err) {
      return { data: null, error: 'Network error occurred' }
    }
  }

  async logout(): Promise<AuthResponse<null>> {
    try {
      const { error } = await supabase.auth.signOut()

      // Clear stored tokens
      localStorage.removeItem('auth-token')
      localStorage.removeItem('refresh-token')
      localStorage.removeItem('remember-me')

      if (error) {
        return { data: null, error: this.getErrorMessage(error) }
      }

      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: 'Logout failed' }
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        return this.mapSupabaseUser(user)
      }

      return null
    } catch (err) {
      return null
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      return session
    } catch (err) {
      return null
    }
  }

  async refreshSession(): Promise<AuthResponse<AuthUser>> {
    try {
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        return { data: null, error: this.getErrorMessage(error) }
      }

      if (data.session && data.user) {
        // Update stored tokens
        localStorage.setItem('auth-token', data.session.access_token)
        localStorage.setItem('refresh-token', data.session.refresh_token)

        const authUser = this.mapSupabaseUser(data.user)
        return { data: authUser, error: null }
      }

      return { data: null, error: 'Session refresh failed' }
    } catch (err) {
      return { data: null, error: 'Network error occurred' }
    }
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const authUser = this.mapSupabaseUser(session.user)

        // Update stored tokens when session changes
        localStorage.setItem('auth-token', session.access_token)
        localStorage.setItem('refresh-token', session.refresh_token)

        callback(authUser)
      } else {
        // Clear tokens when signed out
        localStorage.removeItem('auth-token')
        localStorage.removeItem('refresh-token')
        callback(null)
      }
    })
  }

  private mapSupabaseUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email || '',
      username: user.user_metadata?.username || user.email?.split('@')[0] || '',
      created_at: user.created_at,
    }
  }

  private getErrorMessage(error: AuthError): string {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password. Please try again.'
      case 'Email not confirmed':
        return 'Please confirm your email address before signing in.'
      case 'User already registered':
        return 'An account with this email already exists.'
      case 'Password should be at least 6 characters':
        return 'Password must be at least 6 characters long.'
      case 'Unable to validate email address: invalid format':
        return 'Please enter a valid email address.'
      case 'Signup is disabled':
        return 'Account registration is currently disabled.'
      default:
        return error.message || 'An unexpected error occurred.'
    }
  }
}

export const authService = new AuthService()
