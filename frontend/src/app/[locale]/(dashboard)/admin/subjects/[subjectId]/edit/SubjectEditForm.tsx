'use client';

import { useState } from 'react';
import { useRouter } from '@/lib/navigation';
import { Button, ToggleSwitch } from 'flowbite-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { updateSubject, type Subject, type UpdateSubjectRequest } from '@/lib/api/subjects';

interface SubjectEditFormProps {
  subject: Subject;
}

// Client component for editing existing subjects - uses reusable Input/Textarea components
export function SubjectEditForm({ subject }: SubjectEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<UpdateSubjectRequest>({
    name: subject.name,
    description: subject.description,
    is_active: subject.is_active,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await updateSubject(subject.id, formData);
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update subject');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-background-elevated p-6 rounded-xl border border-border">
      <Input
        label="Subject Name"
        id="name"
        type="text"
        value={formData.name || ''}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        helperText="Enter the subject name"
      />

      <Textarea
        label="Description"
        id="description"
        value={formData.description || ''}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows={3}
        helperText="Optional description of the subject"
      />

      <div className="flex items-center gap-3">
        <ToggleSwitch
          checked={formData.is_active ?? true}
          onChange={(checked) => setFormData({ ...formData, is_active: checked })}
          label="Active"
        />
        <span className="text-sm text-text-secondary">
          {formData.is_active ? 'Subject is active' : 'Subject is inactive'}
        </span>
      </div>

      {error && (
        <div className="text-danger bg-danger/10 border border-danger/30 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary-hover text-text-inverse px-6 py-2.5 rounded-lg font-medium transition-all">
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button
          className="bg-interactive-secondary hover:bg-interactive-secondary-hover text-text-primary px-6 py-2.5 rounded-lg font-medium transition-all"
          onClick={() => router.push('/admin')}
          type="button"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
