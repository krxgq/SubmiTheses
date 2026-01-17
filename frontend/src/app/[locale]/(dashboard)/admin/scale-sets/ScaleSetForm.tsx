'use client';

import { Button, Label, Select } from 'flowbite-react';
import { Input } from '@/components/ui/Input';
import type { UpdateScaleSetRequest } from '@/lib/api/scale-sets';
import type { Year } from '@sumbi/shared-types';

interface ScaleSetFormProps {
  formData: UpdateScaleSetRequest;
  onFormChange: (data: UpdateScaleSetRequest) => void;
  onSubmit: (e: React.FormEvent) => void;
  years: Year[];
  loading: boolean;
  onCancel: () => void;
  submitButtonText?: string;
}

export function ScaleSetForm({
  formData,
  onFormChange,
  onSubmit,
  years,
  loading,
  onCancel,
  submitButtonText = 'Save Changes',
}: ScaleSetFormProps) {
  return (
    <form onSubmit={onSubmit} className="bg-background-elevated p-6 rounded-xl border border-border space-y-6">
      <h2 className="text-lg font-semibold text-text-primary">Basic Information</h2>

      <Input
        label="Scale Set Name"
        id="name"
        type="text"
        value={formData.name}
        onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
        required
      />

      <div>
        <Label htmlFor="year_id" className="mb-2">Academic Year</Label>
        <Select
          id="year_id"
          value={String(formData.year_id)}
          onChange={(e) => onFormChange({ ...formData, year_id: BigInt(e.target.value) })}
          required
        >
          {years.map((year) => (
            <option key={String(year.id)} value={String(year.id)}>
              {year.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="project_role" className="mb-2">Project Role</Label>
        <Select
          id="project_role"
          value={formData.project_role}
          onChange={(e) =>
            onFormChange({ ...formData, project_role: e.target.value as 'supervisor' | 'opponent' })
          }
          required
        >
          <option value="supervisor">Supervisor</option>
          <option value="opponent">Opponent</option>
        </Select>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary-hover text-text-inverse px-6 py-2.5 rounded-lg font-medium transition-all">
          {loading ? 'Saving...' : submitButtonText}
        </Button>
        <Button className="bg-interactive-secondary hover:bg-interactive-secondary-hover text-text-primary px-6 py-2.5 rounded-lg font-medium transition-all" onClick={onCancel} type="button">
          Cancel
        </Button>
      </div>
    </form>
  );
}
