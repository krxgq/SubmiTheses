'use client';

import { useState } from 'react';
import { useRouter } from '@/lib/navigation';
import { Button, Label, Select } from 'flowbite-react';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import {
  updateScaleSet,
  addScaleToSet,
  removeScaleFromSet,
  type ScaleSet,
  type UpdateScaleSetRequest,
} from '@/lib/api/scale-sets';
import type { Scale } from '@/lib/api/scales';
import type { Year } from '@sumbi/shared-types';

interface ScaleSetEditFormProps {
  scaleSet: ScaleSet;
  availableScales: Scale[];
  years: Year[];
}

// Client component for editing scale sets including managing scales - uses reusable Input component
export function ScaleSetEditForm({ scaleSet, availableScales, years }: ScaleSetEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<UpdateScaleSetRequest>({
    name: scaleSet.name,
    year_id: scaleSet.year_id,
    project_role: scaleSet.project_role,
  });

  // State for adding new scale
  const [selectedScaleId, setSelectedScaleId] = useState<bigint | null>(null);
  const [newScaleWeight, setNewScaleWeight] = useState(10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await updateScaleSet(scaleSet.id, formData);
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update scale set');
      setLoading(false);
    }
  };

  const handleAddScale = async () => {
    if (!selectedScaleId) return;

    setError('');
    try {
      await addScaleToSet(scaleSet.id, {
        scale_id: selectedScaleId,
        weight: newScaleWeight,
      });
      router.refresh();
      setSelectedScaleId(null);
      setNewScaleWeight(10);
    } catch (err: any) {
      setError(err.message || 'Failed to add scale');
    }
  };

  const handleRemoveScale = async (scaleId: bigint, scaleName: string) => {
    if (!confirm(`Remove "${scaleName}" from this scale set?`)) return;

    setError('');
    try {
      await removeScaleFromSet(scaleSet.id, scaleId);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to remove scale');
    }
  };

  const currentScaleIds = new Set(
    scaleSet.scale_set_scales?.map((sss) => String(sss.scale_id)) || []
  );
  const unusedScales = availableScales.filter(
    (scale) => !currentScaleIds.has(String(scale.id))
  );

  const totalWeight = scaleSet.scale_set_scales?.reduce(
    (sum, sss) => sum + sss.weight,
    0
  ) || 0;

  return (
    <div className="space-y-6">
      {/* Basic Info Form */}
      <form onSubmit={handleSubmit} className="bg-background-elevated p-6 rounded-xl border border-border space-y-6">
        <h2 className="text-lg font-semibold text-text-primary">Basic Information</h2>

        <Input
          label="Scale Set Name"
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <div>
          <Label htmlFor="year_id" className="mb-2">Academic Year</Label>
          <Select
            id="year_id"
            value={String(formData.year_id)}
            onChange={(e) => setFormData({ ...formData, year_id: BigInt(e.target.value) })}
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
              setFormData({ ...formData, project_role: e.target.value as 'supervisor' | 'opponent' })
            }
            required
          >
            <option value="supervisor">Supervisor</option>
            <option value="opponent">Opponent</option>
          </Select>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button color="gray" onClick={() => router.push('/admin')} type="button">
            Cancel
          </Button>
        </div>
      </form>

      {/* Scales Management */}
      <div className="bg-background-elevated p-6 rounded-xl border border-border space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Scales in This Set</h2>
          <div className="text-sm text-text-secondary">
            Total Weight: <span className={totalWeight === 100 ? 'text-green-600 font-semibold' : 'text-orange-600 font-semibold'}>{totalWeight}%</span>
            {totalWeight !== 100 && ' (should be 100%)'}
          </div>
        </div>

        {/* Current Scales List */}
        {scaleSet.scale_set_scales && scaleSet.scale_set_scales.length > 0 ? (
          <div className="space-y-2">
            {scaleSet.scale_set_scales.map((sss) => (
              <div
                key={String(sss.id)}
                className="flex items-center justify-between p-3 bg-background-secondary rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-text-primary">{sss.scales.name}</p>
                  <p className="text-xs text-text-secondary">Max: {String(sss.scales.maxVal)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-background-elevated rounded-lg text-sm font-medium">
                    {sss.weight}%
                  </span>
                  <button
                    onClick={() => handleRemoveScale(sss.scale_id, sss.scales.name)}
                    className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-sm italic">No scales added yet.</p>
        )}

        {/* Add Scale Form */}
        {unusedScales.length > 0 && (
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Add Scale</h3>
            <div className="flex gap-3">
              <Select
                value={selectedScaleId ? String(selectedScaleId) : ''}
                onChange={(e) => setSelectedScaleId(e.target.value ? BigInt(e.target.value) : null)}
                className="flex-1"
              >
                <option value="">Select a scale...</option>
                {unusedScales.map((scale) => (
                  <option key={String(scale.id)} value={String(scale.id)}>
                    {scale.name} (max: {String(scale.maxVal)})
                  </option>
                ))}
              </Select>
              <Input
                label="Weight %"
                id="newScaleWeight"
                type="number"
                min={0}
                max={100}
                value={newScaleWeight.toString()}
                onChange={(e) => setNewScaleWeight(Number(e.target.value))}
                className="w-28"
              />
              <Button onClick={handleAddScale} disabled={!selectedScaleId} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="text-danger bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
