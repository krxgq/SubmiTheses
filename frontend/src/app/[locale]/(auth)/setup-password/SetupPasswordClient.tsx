'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from 'flowbite-react';
import { Input } from '@/components/ui/Input';
import { apiRequest } from '@/lib/api/client';

/**
 * Password Setup Client Component
 * Validates invitation token and allows user to set their password
 */
export default function SetupPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // UI states
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null>(null);

  // Form states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setValidating(false);
      setTokenValid(false);
      return;
    }

    validateToken();
  }, [token]);

  // Validate invitation token
  const validateToken = async () => {
    try {
      const response = await apiRequest(`/users/validate-invitation?token=${token}`) as {
        valid: boolean;
        firstName?: string;
        lastName?: string;
        email?: string;
        error?: string;
      };

      if (response.valid) {
        setTokenValid(true);
        setUserInfo({
          firstName: response.firstName,
          lastName: response.lastName,
          email: response.email,
        });
      } else {
        setTokenValid(false);
        setError(response.error || 'Invalid or expired invitation token');
      }
    } catch (err: any) {
      setTokenValid(false);
      setError('Failed to validate invitation token');
    } finally {
      setValidating(false);
    }
  };

  // Handle password setup submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest('/users/setup-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      }) as {
        success: boolean;
        message?: string;
      };

      if (response.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth');
        }, 3000);
      } else {
        setError(response.message || 'Failed to set password');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to set password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state - validating token
  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full bg-background-elevated rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Validating your invitation...</p>
        </div>
      </div>
    );
  }

  // Invalid or expired token
  if (!tokenValid || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full bg-background-elevated rounded-lg shadow-lg p-8">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-danger/10 dark:bg-danger/10 p-3">
              <svg
                className="w-12 h-12 text-danger dark:text-danger"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-center text-text-primary mb-4">
            Invitation Expired
          </h1>
          <p className="text-center text-text-secondary mb-6">
            {error || 'This invitation link has expired or is invalid.'}
          </p>

          {/* Instructions */}
          <div className="bg-warning/10 dark:bg-warning/10 border border-warning/30 dark:border-warning/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-warning dark:text-warning">
              Please contact your administrator to receive a new invitation email.
            </p>
          </div>

          {/* Back to Login */}
          <Button onClick={() => router.push('/auth')} className="w-full bg-primary hover:bg-primary-hover text-text-inverse px-6 py-2.5 rounded-lg font-medium transition-all">
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  // Success state - password set
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full bg-background-elevated rounded-lg shadow-lg p-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-success/10 dark:bg-success/10 p-3">
              <svg
                className="w-12 h-12 text-success dark:text-success"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-center text-text-primary mb-4">
            Success!
          </h1>
          <p className="text-center text-text-secondary mb-2">
            Your password has been set successfully.
          </p>
          <p className="text-center text-sm text-text-tertiary">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  // Password setup form
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-background-elevated rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Welcome{userInfo?.firstName ? `, ${userInfo.firstName}` : ''}!
          </h1>
          <p className="text-text-secondary">
            Set a password for your account
          </p>
          {userInfo?.email && (
            <p className="text-sm text-text-tertiary mt-2 font-mono">
              {userInfo.email}
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password */}
          <Input
            label="Password"
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="Minimum 6 characters"
          />

          {/* Confirm Password */}
          <Input
            label="Confirm Password"
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {/* Error Message */}
          {error && (
            <div className="bg-danger/10 dark:bg-danger/10 border border-danger/30 dark:border-danger/30 rounded-lg p-3">
              <p className="text-sm text-danger dark:text-danger">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-hover text-text-inverse px-6 py-2.5 rounded-lg font-medium transition-all">
            {loading ? 'Setting Password...' : 'Set Password'}
          </Button>
        </form>

        {/* Security Note */}
        <p className="text-xs text-center text-text-tertiary mt-6">
          After setting your password, you'll be redirected to the login page where you can sign in
          to your account.
        </p>
      </div>
    </div>
  );
}
