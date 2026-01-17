'use client';

import { useState } from 'react';
import { useRouter } from '@/lib/navigation';
import { Button } from 'flowbite-react';
import { createScaleSet, type CreateScaleSetRequest, type ScaleSet } from '@/lib/api/scale-sets';
import type { Year } from '@sumbi/shared-types';
import { useApi } from '@/hooks/useApi';
import { ScaleSetForm } from '../ScaleSetForm';

interface ScaleSetCreateFormProps {
  years: Year[];
}

export function ScaleSetCreateForm({ years }: ScaleSetCreateFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<CreateScaleSetRequest>>({
    year_id: years[0]?.id || BigInt(1),
    project_role: 'supervisor',
  });

  const { execute: create, loading, error } = useApi<[CreateScaleSetRequest], ScaleSet>(createScaleSet);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await create(formData as CreateScaleSetRequest);
      if (created) {
        router.push(`/admin/scale-sets/${created.id}/edit`);
      }
    } catch (err) {
      // Error is already set by useApi hook, and will be displayed by the form
    }
  };

  return (
    <div>
      <ScaleSetForm
        formData={formData as CreateScaleSetRequest}
        onFormChange={setFormData}
        onSubmit={handleSubmit}
        years={years}
        loading={loading}
        onCancel={() => router.push('/admin')}
        submitButtonText="Create & Add Scales"
      />

      <div className="mt-4 bg-primary/10 border border-primary/30 rounded-lg p-3">
        <p className="text-sm text-primary">
          <strong>Note:</strong> After creating the scale set, you'll be able to add individual scales with weights on the edit page.
        </p>
      </div>

      {error && (
        <div className="mt-4 text-danger bg-danger/10 border border-danger/30 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
