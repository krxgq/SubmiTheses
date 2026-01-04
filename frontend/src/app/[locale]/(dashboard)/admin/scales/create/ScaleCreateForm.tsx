'use client';

import { useState } from 'react';
import { useRouter } from '@/lib/navigation';
import { Button } from 'flowbite-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { createScale, type CreateScaleRequest } from '@/lib/api/scales';

// Client component for creating new scales - uses reusable Input/Textarea components
export function ScaleCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateScaleRequest>({
    name: '',
    desc: '',
    maxVal: 100,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createScale(formData);
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create scale');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-background-elevated p-6 rounded-xl border border-border">
      <Input
        label="Scale Name"
        id="name"
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        helperText="e.g., Project Quality, Presentation Skills"
      />

      <Textarea
        label="Description"
        id="desc"
        value={formData.desc}
        onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
        rows={3}
        helperText="Optional description of what this scale measures"
      />

      <Input
        label="Maximum Value"
        id="maxVal"
        type="number"
        min={1}
        value={formData.maxVal.toString()}
        onChange={(e) => setFormData({ ...formData, maxVal: parseInt(e.target.value) || 0 })}
        required
        helperText="The highest possible score for this scale"
      />

      {error && (
        <div className="text-danger bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Scale'}
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
