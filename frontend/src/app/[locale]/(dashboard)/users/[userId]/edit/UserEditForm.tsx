'use client';

import { useState } from 'react';
import { useRouter } from '@/lib/navigation';
import type { UserWithYear, UserRole } from '@sumbi/shared-types';

interface UserEditFormProps {
  user: UserWithYear;
  updateUser: (formData: {
    full_name: string;
    email: string;
    role: UserRole;
    year_id: number | null;
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
    full_name: user.full_name || '',
    email: user.email,
    role: user.role,
    year_id: user.year_id,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          {translations.fullName}
        </label>
        <input
          type="text"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          className="w-full px-4 py-2 bg-background-secondary border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          {translations.email}
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 bg-background-secondary border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          {translations.role}
        </label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
          className="w-full px-4 py-2 bg-background-secondary border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          required
        >
          <option value="admin">{translations.roles.admin}</option>
          <option value="teacher">{translations.roles.teacher}</option>
          <option value="student">{translations.roles.student}</option>
        </select>
      </div>

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
