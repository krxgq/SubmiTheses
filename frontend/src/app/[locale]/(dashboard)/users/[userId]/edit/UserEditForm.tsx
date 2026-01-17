'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/lib/navigation';
import { getAllYears } from '@/lib/api/years';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { UserWithYear, UserRole, Year } from '@sumbi/shared-types';

interface UserEditFormProps {
  user: UserWithYear & { class?: string | null };
  updateUser: (formData: {
    first_name: string;
    last_name: string;
    email: string;
    role: UserRole;
    year_id: number | null;
    class?: string;
  }) => Promise<void>;
  translations: {
    fullName: string;
    email: string;
    role: string;
    year: string;
    save: string;
    cancel: string;
    roles: {
      admin: string;
      teacher: string;
      student: string;
    };
  };
}

export function UserEditForm({ user, updateUser, translations }: UserEditFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email,
    role: user.role,
    year_id: user.year_id ? Number(user.year_id) : null,
    class: user.class || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      } finally {
        setYearsLoading(false);
      }
    };

    fetchYears();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate: students must have year_id
    if (formData.role === 'student' && !formData.year_id) {
      setError('Academic year is required for students');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await updateUser(formData);
    } catch (err) {
      console.error('[UserEditForm] Error:', err);
      setError('Failed to update user. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          id="first-name"
          type="text"
          value={formData.first_name}
          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
        />
        <Input
          label="Last Name"
          id="last-name"
          type="text"
          value={formData.last_name}
          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
        />
      </div>

      <Input
        label={translations.email}
        id="email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />

      <Select
        label={translations.role}
        id="role"
        value={formData.role}
        onChange={(value) => {
          const newRole = value as UserRole;
          setFormData({
            ...formData,
            role: newRole,
            // Clear year_id when changing from student to non-student
            year_id: newRole === 'student' ? formData.year_id : null
          });
        }}
        options={[
          { value: 'admin', label: translations.roles.admin },
          { value: 'teacher', label: translations.roles.teacher },
          { value: 'student', label: translations.roles.student },
        ]}
        required
      />

      {/* Academic Year and Class (required for students) */}
      {formData.role === 'student' && (
        <div className="grid grid-cols-2 gap-4">
          <Select
            label={translations.year}
            id="year"
            required
            value={formData.year_id?.toString() || ''}
            onChange={(value) => setFormData({
              ...formData,
              year_id: value ? parseInt(value) : null
            })}
            options={years.map(year => ({
              value: year.id.toString(),
              label: year.name || `Year ${year.id}`
            }))}
            placeholder={yearsLoading ? 'Loading...' : 'Select year'}
            disabled={yearsLoading || years.length === 0}
            helperText={
              years.length === 0 && !yearsLoading
                ? 'No academic years available'
                : undefined
            }
          />
          <Input
            label="Class"
            id="class"
            type="text"
            value={formData.class}
            onChange={(e) => setFormData({ ...formData, class: e.target.value })}
            maxLength={10}
          />
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-primary text-text-inverse rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : translations.save}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-background-secondary text-text-primary rounded-lg hover:bg-background-hover transition-colors"
        >
          {translations.cancel}
        </button>
      </div>
    </form>
  );
}
