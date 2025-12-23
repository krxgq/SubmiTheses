import { useState, useEffect } from 'react'
import { authService, type AuthUser, type LoginCredentials, type RegisterCredentials } from '@/lib/auth'

interface UseAuthReturn {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        if (mounted) {
          setUser(currentUser)
          setIsLoading(false)
        }
      } catch (error) {
        if (mounted) {
          setUser(null)
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    // Subscribe to auth state changes (cross-tab)
    const unsubscribe = authService.onAuthStateChange((authUser) => {
      if (mounted) {
        setUser(authUser)
        setIsLoading(false)
      }
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      const result = await authService.login(credentials)

      if (result.error) {
        setIsLoading(false)
        return { success: false, error: result.error }
      }

      // Immediately set user state after successful login
      if (result.data) {
        setUser(result.data)
      }
      setIsLoading(false)
      return { success: true }
    } catch (error) {
      setIsLoading(false)
      return { success: false, error: 'Login failed. Please try again.' }
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true)
    try {
      const result = await authService.register(credentials)

      if (result.error) {
        setIsLoading(false)
        return { success: false, error: result.error }
      }

      // Immediately set user state after successful registration (with immediate login)
      if (result.data) {
        setUser(result.data)
      }

      setIsLoading(false)
      // Success - either with user data or email confirmation required
      return { success: true }
    } catch (error) {
      setIsLoading(false)
      return { success: false, error: 'Registration failed. Please try again.' }
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await authService.logout()
      // Immediately clear user state (don't wait for broadcast)
      setUser(null)
      setIsLoading(false)
    } catch (error) {
      console.error('[useAuth] Logout error:', error)
      // Even if logout fails, clear the local state
      setUser(null)
      setIsLoading(false)
    }
  }

  const refreshSession = async () => {
    try {
      await authService.refreshSession()
      // Re-fetch current user after refresh
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      // If refresh fails, logout user
      setUser(null)
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshSession,
  }
}