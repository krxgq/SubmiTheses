'use client';

import { useState } from 'react';
import { useRouter } from '@/lib/navigation';
import { Button, Label, Select } from 'flowbite-react';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import {
  addScaleToSet,
  removeScaleFromSet,
  type ScaleSet,
  type AddScaleToSetRequest,
  type ScaleSetScale,
} from '@/lib/api/scale-sets';
import type { Scale } from '@/lib/api/scales';
import { useApi } from '@/hooks/useApi';

interface ScaleSetScalesManagerProps {
  scaleSet: ScaleSet;
  availableScales: Scale[];
}

export function ScaleSetScalesManager({ scaleSet, availableScales }: ScaleSetScalesManagerProps) {
  const router = useRouter();
  const [selectedScaleId, setSelectedScaleId] = useState<bigint | null>(null);
  const [newScaleWeight, setNewScaleWeight] = useState(10);

  const { execute: addScale, loading: isAdding } = useApi<[bigint, AddScaleToSetRequest], ScaleSetScale>(addScaleToSet);
  const { execute: removeScale, loading: isRemoving } = useApi<[bigint, bigint], void>(removeScaleFromSet);

  const handleAddScale = async () => {
    if (!selectedScaleId) return;

    try {
      await addScale(scaleSet.id, {
        scale_id: selectedScaleId,
        weight: newScaleWeight,
      });
      router.refresh();
      setSelectedScaleId(null);
      setNewScaleWeight(10);
    } catch (err) {
      // Error is handled by useApi
    }
  };

  const handleRemoveScale = async (scaleId: bigint, scaleName: string) => {
    if (!confirm(`Remove "${scaleName}" from this scale set?`)) return;
    try {
      await removeScale(scaleSet.id, scaleId);
      router.refresh();
    } catch (err) {
      // Error is handled by useApi
    }
  };

  const currentScaleIds = new Set(
    scaleSet.scale_set_scales?.map((sss) => String(sss.scale_id)) || []
  );
  const unusedScales = availableScales.filter(
    (scale) => !currentScaleIds.has(String(scale.id))
  );

  const totalWeight =
    scaleSet.scale_set_scales?.reduce((sum, sss) => sum + sss.weight, 0) || 0;

  return (
    <div className="bg-background-elevated p-6 rounded-xl border border-border space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Scales in This Set</h2>
        <div className="text-sm text-text-secondary">
          Total Weight:{' '}
          <span
            className={
              totalWeight === 100
                ? 'text-success font-semibold'
                : 'text-warning font-semibold'
            }
          >
            {totalWeight}%
          </span>
          {totalWeight !== 100 && ' (should be 100%)'}
        </div>
      </div>

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
                  disabled={isRemoving}
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
            <Button onClick={handleAddScale} disabled={!selectedScaleId || isAdding} size="sm" className="bg-primary hover:bg-primary-hover text-text-inverse px-4 py-2 rounded-lg font-medium transition-all">
              <Plus className="w-4 h-4 mr-1" />
              {isAdding ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
