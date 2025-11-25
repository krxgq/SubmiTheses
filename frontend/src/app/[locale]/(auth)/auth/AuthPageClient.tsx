'use client'
import { TabItem, Tabs } from "flowbite-react"
import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Shield, CheckCircle, XCircle } from 'lucide-react'
import { useRouter } from '@/lib/navigation'
import { useAuthContext } from '@/components/providers/AuthProvider'

export default function AuthPageClient() {
    const router = useRouter()
    const { login, register, isLoading: authLoading } = useAuthContext()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('login')

    // Form states
    const [loginForm, setLoginForm] = useState({ email: '', password: '', rememberMe: false })
    const [registerForm, setRegisterForm] = useState({
        email: '',
        username: '',
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

        if (!registerForm.username) {
            errors.username = 'Username is required'
        } else if (registerForm.username.length < 3) {
            errors.username = 'Username must be at least 3 characters'
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
                setSuccessMessage('Successfully logged in!')
                setTimeout(() => {
                    router.push('/projects')
                }, 1500)
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
                username: registerForm.username,
                firstName: registerForm.firstName,
                lastName: registerForm.lastName,
                subscribeNewsletter: registerForm.subscribeNewsletter
            })
            if (result.success) {
                setSuccessMessage('Account created successfully! Please check your email to verify your account.')
                setTimeout(() => {
                    setActiveTab('login')
                }, 2000)
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
        if (passwordStrength <= 1) return 'bg-red-500 dark:bg-red-400'
        if (passwordStrength <= 3) return 'bg-yellow-500 dark:bg-yellow-400'
        return 'bg-green-500 dark:bg-green-400'
    }

    const getPasswordStrengthText = () => {
        if (passwordStrength <= 1) return 'Weak'
        if (passwordStrength <= 3) return 'Medium'
        return 'Strong'
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-2">Welcome</h1>
                    <p className="text-secondary">Sign in to your account or create a new one</p>
                </div>

                {/* Global Messages */}
                {authError && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                        <XCircle className="w-5 h-5" />
                        {authError}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        {successMessage}
                    </div>
                )}

                <div className="bg-surface rounded-xl shadow-sm border">
                    <div className="[&_.flex.text-center]:w-full [&_.flex.text-center]:mx-auto [&_.flex.text-center]:justify-center [&_button]:flex-1 [&_button]:px-8 [&_button]:py-3">
                        <Tabs
                            aria-label="Auth tabs"
                            variant="underline"
                            className="px-6 pt-3 pb-6"
                            onActiveTabChange={(tab) => setActiveTab(tab === 0 ? 'login' : 'register')}
                        >
                        <TabItem title="Sign In" active={activeTab === 'login'}>
                            <form onSubmit={handleLogin} className="space-y-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-primary mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={loginForm.email}
                                            onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                                            className={`w-full pl-10 pr-4 py-3 bg-input-background border ${loginErrors.email ? 'border-red-500 dark:border-red-400' : 'border'
                                                } rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-primary`}
                                            placeholder="Enter your email"
                                        />
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />
                                    </div>
                                    {loginErrors.email && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{loginErrors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-primary mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={loginForm.password}
                                            onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                                            className={`w-full pl-10 pr-12 py-3 bg-input-background border ${loginErrors.password ? 'border-red-500 dark:border-red-400' : 'border'
                                                } rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-primary`}
                                            placeholder="Enter your password"
                                        />
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {loginErrors.password && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{loginErrors.password}</p>
                                    )}
                                </div>

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
                                    <button type="button" className="text-sm text-primary hover:text-blue-700 dark:hover:text-blue-400">
                                        Forgot password?
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || authLoading}
                                    className="w-full bg-primary hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                                >
                                    {(isLoading || authLoading) ? 'Signing In...' : 'Sign In'}
                                </button>
                            </form>
                        </TabItem>

                        <TabItem title="Sign Up" active={activeTab === 'register'}>
                            <form onSubmit={handleRegister} className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-primary mb-2">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            value={registerForm.firstName}
                                            onChange={(e) => setRegisterForm(prev => ({ ...prev, firstName: e.target.value }))}
                                            className={`w-full px-4 py-3 bg-input-background border ${registerErrors.firstName ? 'border-red-500 dark:border-red-400' : 'border'
                                                } rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-primary`}
                                            placeholder="First name"
                                        />
                                        {registerErrors.firstName && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{registerErrors.firstName}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-primary mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            value={registerForm.lastName}
                                            onChange={(e) => setRegisterForm(prev => ({ ...prev, lastName: e.target.value }))}
                                            className={`w-full px-4 py-3 bg-input-background border ${registerErrors.lastName ? 'border-red-500 dark:border-red-400' : 'border'
                                                } rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-primary`}
                                            placeholder="Last name"
                                        />
                                        {registerErrors.lastName && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{registerErrors.lastName}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-primary mb-2">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={registerForm.username}
                                            onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value }))}
                                            className={`w-full pl-10 pr-4 py-3 bg-input-background border ${registerErrors.username ? 'border-red-500 dark:border-red-400' : 'border'
                                                } rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-primary`}
                                            placeholder="Choose a username"
                                        />
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />
                                    </div>
                                    {registerErrors.username && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{registerErrors.username}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-primary mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={registerForm.email}
                                            onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                                            className={`w-full pl-10 pr-4 py-3 bg-input-background border ${registerErrors.email ? 'border-red-500 dark:border-red-400' : 'border'
                                                } rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-primary`}
                                            placeholder="Enter your email"
                                        />
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />
                                    </div>
                                    {registerErrors.email && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{registerErrors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-primary mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={registerForm.password}
                                            onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                                            className={`w-full pl-10 pr-12 py-3 bg-input-background border ${registerErrors.password ? 'border-red-500 dark:border-red-400' : 'border'
                                                } rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-primary`}
                                            placeholder="Create a password"
                                        />
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {registerForm.password && (
                                        <div className="mt-2">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs text-secondary">Password strength:</span>
                                                <span className={`text-xs font-medium ${passwordStrength <= 1 ? 'text-red-600 dark:text-red-400' :
                                                        passwordStrength <= 3 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
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
                                    {registerErrors.password && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{registerErrors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-primary mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={registerForm.confirmPassword}
                                            onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            className={`w-full pl-10 pr-12 py-3 bg-input-background border ${registerErrors.confirmPassword ? 'border-red-500 dark:border-red-400' : 'border'
                                                } rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-primary`}
                                            placeholder="Confirm your password"
                                        />
                                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {registerErrors.confirmPassword && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{registerErrors.confirmPassword}</p>
                                    )}
                                </div>

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
                                            <a href="/terms" className="text-primary hover:text-blue-700 dark:hover:text-blue-400 underline">
                                                Terms and Conditions
                                            </a>{' '}
                                            and{' '}
                                            <a href="/privacy" className="text-primary hover:text-blue-700 dark:hover:text-blue-400 underline">
                                                Privacy Policy
                                            </a>
                                        </span>
                                    </label>
                                    {registerErrors.acceptTerms && (
                                        <p className="text-sm text-red-600 dark:text-red-400">{registerErrors.acceptTerms}</p>
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
                                    className="w-full bg-primary hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                                >
                                    {(isLoading || authLoading) ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </form>
                        </TabItem>
                    </Tabs>
                    </div>
                </div>
            </div>
        </div>
    )
}
