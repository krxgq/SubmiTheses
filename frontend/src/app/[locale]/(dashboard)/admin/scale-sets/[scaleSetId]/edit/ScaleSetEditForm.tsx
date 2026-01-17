'use client';

import type { ScaleSet } from '@/lib/api/scale-sets';
import type { Scale } from '@/lib/api/scales';
import type { Year } from '@sumbi/shared-types';
import { ScaleSetInfoForm } from './ScaleSetInfoForm';
import { ScaleSetScalesManager } from './ScaleSetScalesManager';

interface ScaleSetEditFormProps {
  scaleSet: ScaleSet;
  availableScales: Scale[];
  years: Year[];
}

export function ScaleSetEditForm({ scaleSet, availableScales, years }: ScaleSetEditFormProps) {
  return (
    <div className="space-y-6">
      <ScaleSetInfoForm scaleSet={scaleSet} years={years} />
      <ScaleSetScalesManager scaleSet={scaleSet} availableScales={availableScales} />
    </div>
  );
}
