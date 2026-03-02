'use client'
import { TabItem, Tabs } from "flowbite-react"
import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Shield, CheckCircle, XCircle, GraduationCap, Folder } from 'lucide-react'
import { useRouter } from '@/lib/navigation'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { Input } from '@/components/ui/Input'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function AuthPageClient() {
    // Feature flag: set to true to enable public registration
    const REGISTRATION_ENABLED = false

    const router = useRouter()
    const { login, register, isLoading: authLoading } = useAuthContext()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Form states
    const [loginForm, setLoginForm] = useState({ email: '', password: '', rememberMe: false })
    const [registerForm, setRegisterForm] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        acceptTerms: false,
        subscribeNewsletter: false
    })

    // Error states
    const [loginErrors, setLoginErrors] = useState<Record<string, string>>({})
    const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({})

    // General feedback
    const [authError, setAuthError] = useState<string>('')
    const [successMessage, setSuccessMessage] = useState<string>('')

    // Password strength calculation
    const calculatePasswordStrength = (password: string) => {
        let strength = 0
        if (password.length >= 8) strength++
        if (/[a-z]/.test(password)) strength++
        if (/[A-Z]/.test(password)) strength++
        if (/[0-9]/.test(password)) strength++
        if (/[^A-Za-z0-9]/.test(password)) strength++
        return strength
    }

    // Validation functions
    const validateLoginForm = () => {
        const errors: Record<string, string> = {}

        if (!loginForm.email) {
            errors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
            errors.email = 'Email is invalid'
        }

        if (!loginForm.password) {
            errors.password = 'Password is required'
        }

        setLoginErrors(errors)
        return Object.keys(errors).length === 0
    }

    const validateRegisterForm = () => {
        const errors: Record<string, string> = {}

        if (!registerForm.email) {
            errors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
            errors.email = 'Email is invalid'
        }

        if (!registerForm.firstName) {
            errors.firstName = 'First name is required'
        }

        if (!registerForm.lastName) {
            errors.lastName = 'Last name is required'
        }

        if (!registerForm.password) {
            errors.password = 'Password is required'
        } else if (registerForm.password.length < 8) {
            errors.password = 'Password must be at least 8 characters'
        }

        if (registerForm.password !== registerForm.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match'
        }

        if (!registerForm.acceptTerms) {
            errors.acceptTerms = 'You must accept the terms and conditions'
        }

        setRegisterErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Form handlers
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateLoginForm()) return

        setIsLoading(true)
        setAuthError('')
        setSuccessMessage('')

        try {
            const result = await login({
                email: loginForm.email,
                password: loginForm.password,
                rememberMe: loginForm.rememberMe
            })
            if (result.success) {
                // Redirect immediately - no artificial delay
                router.push('/projects')
            } else {
                setAuthError(result.error || 'An error occurred during login')
            }
        } catch (error: any) {
            setAuthError(error.message || 'An error occurred during login')
        } finally {
            setIsLoading(false)
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateRegisterForm()) return

        setIsLoading(true)
        setAuthError('')
        setSuccessMessage('')

        try {
            const result = await register({
                email: registerForm.email,
                password: registerForm.password,
                firstName: registerForm.firstName,
                lastName: registerForm.lastName,
                subscribeNewsletter: registerForm.subscribeNewsletter
            })
            if (result.success) {
                setSuccessMessage('Account created successfully!')
                // Auto-redirect to dashboard
                router.push('/projects')
            } else {
                setAuthError(result.error || 'An error occurred during registration')
            }
        } catch (error: any) {
            setAuthError(error.message || 'An error occurred during registration')
        } finally {
            setIsLoading(false)
        }
    }

    const passwordStrength = calculatePasswordStrength(registerForm.password)
    const getPasswordStrengthColor = () => {
        if (passwordStrength <= 1) return 'bg-danger'
        if (passwordStrength <= 3) return 'bg-warning'
        return 'bg-success'
    }

    const getPasswordStrengthText = () => {
        if (passwordStrength <= 1) return 'Weak'
        if (passwordStrength <= 3) return 'Medium'
        return 'Strong'
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
            {/* Theme toggle in top-right corner */}
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md">
                {/* Logo and branding */}
                <div className="flex flex-col items-center mb-8">
                    <GraduationCap className="text-accent mb-4" size={64} />
                    <h1 className="text-3xl font-bold text-accent mb-2">SubmiTheses</h1>
                    <p className="text-text-secondary text-center">
                        Sign in to your account
                    </p>
                </div>

                {/* Global Messages */}
                {authError && (
                    <div className="mb-4 p-4 bg-danger/10 dark:bg-danger/10 border border-danger/30 dark:border-danger/30 rounded-lg flex items-center gap-2 text-danger dark:text-danger">
                        <XCircle className="w-5 h-5" />
                        {authError}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 p-4 bg-success/10 dark:bg-success/10 border border-success/30 dark:border-success/30 rounded-lg flex items-center gap-2 text-success dark:text-success">
                        <CheckCircle className="w-5 h-5" />
                        {successMessage}
                    </div>
                )}

                <div className="bg-surface rounded-xl shadow-sm border">
                    <div className="px-6 py-6">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <Input
                                    label="Email Address"
                                    id="login-email"
                                    type="email"
                                    value={loginForm.email}
                                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                                    error={loginErrors.email}
                                    leftIcon={<Mail className="w-5 h-5" />}
                                    required
                                />

                                <Input
                                    label="Password"
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    value={loginForm.password}
                                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                                    error={loginErrors.password}
                                    leftIcon={<Lock className="w-5 h-5" />}
                                    rightIcon={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="hover:text-text-primary transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    }
                                    required
                                />

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={loginForm.rememberMe}
                                            onChange={(e) => setLoginForm(prev => ({ ...prev, rememberMe: e.target.checked }))}
                                            className="w-4 h-4 text-primary bg-input-background border rounded focus:ring-primary focus:ring-2"
                                        />
                                        <span className="ml-2 text-sm text-secondary">Remember me</span>
                                    </label>
                                    <button type="button" className="text-sm text-primary hover:text-primary-hover dark:hover:text-primary">
                                        Forgot password?
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || authLoading}
                                    className="w-full bg-primary hover:bg-primary-hover dark:hover:bg-primary/100 disabled:opacity-50 disabled:cursor-not-allowed text-text-inverse font-semibold py-3 px-4 rounded-lg transition-colors"
                                >
                                    {(isLoading || authLoading) ? 'Signing In...' : 'Sign In'}
                                </button>
                            </form>

                        {/* Browse public projects link */}
                        <div className="mt-6 pt-4 border-t border-border">
                            <button
                                type="button"
                                onClick={() => router.push('/gallery')}
                                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-background-hover rounded-lg transition-colors"
                            >
                                <Folder className="w-4 h-4" />
                                Browse Public Projects
                            </button>
                        </div>

                        {/* Public registration disabled - can be re-enabled via REGISTRATION_ENABLED flag */}
                        {REGISTRATION_ENABLED && (
                            <form onSubmit={handleRegister} className="space-y-4 mt-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="First Name"
                                        id="register-first-name"
                                        type="text"
                                        value={registerForm.firstName}
                                        onChange={(e) => setRegisterForm(prev => ({ ...prev, firstName: e.target.value }))}
                                        error={registerErrors.firstName}
                                        required
                                    />

                                    <Input
                                        label="Last Name"
                                        id="register-last-name"
                                        type="text"
                                        value={registerForm.lastName}
                                        onChange={(e) => setRegisterForm(prev => ({ ...prev, lastName: e.target.value }))}
                                        error={registerErrors.lastName}
                                        required
                                    />
                                </div>

                                <Input
                                    label="Email Address"
                                    id="register-email"
                                    type="email"
                                    value={registerForm.email}
                                    onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                                    error={registerErrors.email}
                                    leftIcon={<Mail className="w-5 h-5" />}
                                    required
                                />

                                <div>
                                    <Input
                                        label="Password"
                                        id="register-password"
                                        type={showPassword ? "text" : "password"}
                                        value={registerForm.password}
                                        onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                                        error={registerErrors.password}
                                        leftIcon={<Lock className="w-5 h-5" />}
                                        rightIcon={
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="hover:text-text-primary transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        }
                                        required
                                    />
                                    {registerForm.password && (
                                        <div className="mt-2">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs text-text-secondary">Password strength:</span>
                                                <span className={`text-xs font-medium ${passwordStrength <= 1 ? 'text-danger' :
                                                        passwordStrength <= 3 ? 'text-warning' : 'text-success'
                                                    }`}>
                                                    {getPasswordStrengthText()}
                                                </span>
                                            </div>
                                            <div className="w-full bg-border rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                                                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Input
                                    label="Confirm Password"
                                    id="register-confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={registerForm.confirmPassword}
                                    onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    error={registerErrors.confirmPassword}
                                    leftIcon={<Shield className="w-5 h-5" />}
                                    rightIcon={
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="hover:text-text-primary transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    }
                                    required
                                />

                                <div className="space-y-3">
                                    <label className="flex items-start">
                                        <input
                                            type="checkbox"
                                            checked={registerForm.acceptTerms}
                                            onChange={(e) => setRegisterForm(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                                            className="w-4 h-4 text-primary bg-input-background border rounded focus:ring-primary focus:ring-2 mt-0.5"
                                        />
                                        <span className="ml-2 text-sm text-secondary">
                                            I agree to the{' '}
                                            <a href="/terms" className="text-primary hover:text-primary-hover dark:hover:text-primary underline">
                                                Terms and Conditions
                                            </a>{' '}
                                            and{' '}
                                            <a href="/privacy" className="text-primary hover:text-primary-hover dark:hover:text-primary underline">
                                                Privacy Policy
                                            </a>
                                        </span>
                                    </label>
                                    {registerErrors.acceptTerms && (
                                        <p className="text-sm text-danger dark:text-danger">{registerErrors.acceptTerms}</p>
                                    )}

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={registerForm.subscribeNewsletter}
                                            onChange={(e) => setRegisterForm(prev => ({ ...prev, subscribeNewsletter: e.target.checked }))}
                                            className="w-4 h-4 text-primary bg-input-background border rounded focus:ring-primary focus:ring-2"
                                        />
                                        <span className="ml-2 text-sm text-secondary">
                                            Subscribe to our newsletter for updates and news
                                        </span>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || authLoading}
                                    className="w-full bg-primary hover:bg-primary-hover dark:hover:bg-primary/100 disabled:opacity-50 disabled:cursor-not-allowed text-text-inverse font-semibold py-3 px-4 rounded-lg transition-colors"
                                >
                                    {(isLoading || authLoading) ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
