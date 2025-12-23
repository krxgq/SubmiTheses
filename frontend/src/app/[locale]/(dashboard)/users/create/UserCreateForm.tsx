'use client';

import { useState } from 'react';
import { useRouter } from '@/lib/navigation';
import { usersApi } from '@/lib/api/users';
import { Button, Label, TextInput, Select } from 'flowbite-react';
import type { UserRole } from '@sumbi/shared-types';

// Client component - form for creating new users (admin only)
export default function UserCreateForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'student' as UserRole,
    year_id: undefined as number | undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await usersApi.create(formData);
      // Navigate back to users list on success
      router.push('/users');
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* Email */}
      <div>
        <Label htmlFor="email">Email Address *</Label>
        <TextInput
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="user@example.com"
        />
      </div>

      {/* Password */}
      <div>
        <Label htmlFor="password">Password *</Label>
        <TextInput
          id="password"
          type="password"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Minimum 8 characters"
        />
        <p className="mt-1 text-sm text-gray-500">User will receive these credentials to log in</p>
      </div>

      {/* First Name & Last Name */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <TextInput
            id="firstName"
            type="text"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            placeholder="John"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <TextInput
            id="lastName"
            type="text"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            placeholder="Doe"
          />
        </div>
      </div>

      {/* Role */}
      <div>
        <Label htmlFor="role">Role *</Label>
        <Select
          id="role"
          required
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </Select>
      </div>

      {/* Year (optional, for students) */}
      <div>
        <Label htmlFor="year">Year (optional)</Label>
        <TextInput
          id="year"
          type="number"
          min="1"
          max="10"
          value={formData.year_id || ''}
          onChange={(e) => setFormData({
            ...formData,
            year_id: e.target.value ? parseInt(e.target.value) : undefined
          })}
          placeholder="1-10"
        />
        <p className="mt-1 text-sm text-gray-500">Assign a year/grade level (typically for students)</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create User'}
        </Button>
        <Button
          color="gray"
          onClick={() => router.push('/users')}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
