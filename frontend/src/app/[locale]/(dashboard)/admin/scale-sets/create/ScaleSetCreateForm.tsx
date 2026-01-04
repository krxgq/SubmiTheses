'use client';

import { useState } from 'react';
import { useRouter } from '@/lib/navigation';
import { Button } from 'flowbite-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { createScaleSet, type CreateScaleSetRequest } from '@/lib/api/scale-sets';
import type { Year } from '@sumbi/shared-types';

interface ScaleSetCreateFormProps {
  years: Year[];
}

// Client component for creating new scale sets - uses reusable Input component
export function ScaleSetCreateForm({ years }: ScaleSetCreateFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateScaleSetRequest>({
    name: '',
    year_id: years[0]?.id || BigInt(1),
    project_role: 'supervisor',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const created = await createScaleSet(formData);
      // Redirect to edit page to add scales
      router.push(`/admin/scale-sets/${created.id}/edit`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create scale set');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-background-elevated p-6 rounded-xl border border-border">
      <Input
        label="Scale Set Name"
        id="name"
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        helperText="e.g., Supervisor Grading 2024, Opponent Review Criteria"
      />

      <Select
        label="Academic Year"
        id="year_id"
        value={String(formData.year_id)}
        onChange={(value) => setFormData({ ...formData, year_id: BigInt(value) })}
        options={years.map(y => ({ value: String(y.id), label: y.name || `Year ${y.id}` }))}
        required
      />

      <Select
        label="Project Role"
        id="project_role"
        value={formData.project_role}
        onChange={(value) => setFormData({ ...formData, project_role: value as 'supervisor' | 'opponent' })}
        options={[
          { value: 'supervisor', label: 'Supervisor' },
          { value: 'opponent', label: 'Opponent' }
        ]}
        required
        helperText="Choose whether this scale set is for supervisors or opponents"
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> After creating the scale set, you'll be able to add individual scales with weights on the edit page.
        </p>
      </div>

      {error && (
        <div className="text-danger bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create & Add Scales'}
        </Button>
        <Button
          color="gray"
          onClick={() => router.push('/admin')}
          type="button"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
