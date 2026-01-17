'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/lib/navigation';
import { usersApi } from '@/lib/api/users';
import { getAllYears } from '@/lib/api/years';
import { Button } from 'flowbite-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { UserRole, Year } from '@sumbi/shared-types';

// Client component - form for creating new users (admin only)
export default function UserCreateForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'student' as UserRole,
    year_id: undefined as number | undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [years, setYears] = useState<Year[]>([]);
  const [yearsLoading, setYearsLoading] = useState(true);

  // Fetch years on mount
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const yearsData = await getAllYears();
        setYears(yearsData);
      } catch (err) {
        console.error('Failed to fetch years:', err);
        // Silently fail - years field will just be empty
      } finally {
        setYearsLoading(false);
      }
    };

    fetchYears();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate: students must have year_id
    if (formData.role === 'student' && !formData.year_id) {
      setError('Academic year is required for students');
      setLoading(false);
      return;
    }

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
      <Input
        label="Email Address"
        id="email"
        type="email"
        required
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />

      {/* Invitation Notice */}
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
        <p className="text-sm text-text-primary">
          An invitation email will be sent to the user with a secure link to set their password (valid for 30 days).
        </p>
      </div>

      {/* First Name & Last Name */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          id="firstName"
          type="text"
          value={formData.first_name}
          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
        />
        <Input
          label="Last Name"
          id="lastName"
          type="text"
          value={formData.last_name}
          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
        />
      </div>

      {/* Role */}
      <Select
        label="Role"
        id="role"
        required
        value={formData.role}
        onChange={(value) => {
          const newRole = value as UserRole;
          setFormData({
            ...formData,
            role: newRole,
            // Clear year_id when changing from student to non-student
            year_id: newRole === 'student' ? formData.year_id : undefined
          });
        }}
        options={[
          { value: 'student', label: 'Student' },
          { value: 'teacher', label: 'Teacher' },
          { value: 'admin', label: 'Admin' },
        ]}
      />

      {/* Academic Year (required for students) */}
      {formData.role === 'student' && (
        <Select
          label="Academic Year"
          id="year"
          required
          value={formData.year_id?.toString() || ''}
          onChange={(value) => setFormData({
            ...formData,
            year_id: value ? parseInt(value) : undefined
          })}
          options={years.map(year => ({
            value: year.id.toString(),
            label: year.name || `Year ${year.id}`
          }))}
          placeholder={yearsLoading ? 'Loading years...' : 'Select academic year'}
          disabled={yearsLoading || years.length === 0}
          helperText={
            years.length === 0 && !yearsLoading
              ? 'No academic years available. Please contact admin.'
              : 'Select the academic year for this student'
          }
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="text-danger bg-danger/10 border border-danger/30 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary-hover text-text-inverse px-6 py-2.5 rounded-lg font-medium transition-all">
          {loading ? 'Creating...' : 'Create User'}
        </Button>
        <Button
          className="bg-primary hover:bg-primary-hover text-text-inverse px-6 py-2.5 rounded-lg font-medium transition-all"
          onClick={() => router.push('/users')}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
