'use client';

import { useState } from 'react';
import { useRouter } from '@/lib/navigation';
import { updateScaleSet, type ScaleSet, type UpdateScaleSetRequest } from '@/lib/api/scale-sets';
import type { Year } from '@sumbi/shared-types';
import { useApi } from '@/hooks/useApi';
import { ScaleSetForm } from '../../ScaleSetForm';

interface ScaleSetInfoFormProps {
  scaleSet: ScaleSet;
  years: Year[];
}

export function ScaleSetInfoForm({ scaleSet, years }: ScaleSetInfoFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<UpdateScaleSetRequest>({
    name: scaleSet.name,
    year_id: scaleSet.year_id,
    project_role: scaleSet.project_role,
  });

  const { execute: update, loading, error } = useApi<[bigint, UpdateScaleSetRequest], ScaleSet>(updateScaleSet);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await update(scaleSet.id, formData);
      router.push('/admin');
    } catch (err) {
      // Error is already set by useApi hook
    }
  };

  return (
    <div>
      <ScaleSetForm
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleSubmit}
        years={years}
        loading={loading}
        onCancel={() => router.push('/admin')}
        submitButtonText="Save Changes"
      />
      {error && (
        <div className="mt-4 text-danger bg-danger/10 border border-danger/30 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
