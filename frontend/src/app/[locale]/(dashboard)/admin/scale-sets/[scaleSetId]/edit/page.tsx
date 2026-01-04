import { getScaleSetById } from '@/lib/api/scale-sets';
import { getAllScales } from '@/lib/api/scales';
import { yearsApi } from '@/lib/api/years';
import { ScaleSetEditForm } from './ScaleSetEditForm';
import { Link } from '@/lib/navigation';
import { ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

interface EditScaleSetPageProps {
  params: Promise<{ scaleSetId: string }>;
}

// Server component - fetches scale set, available scales, and years
export default async function EditScaleSetPage({ params }: EditScaleSetPageProps) {
  const { scaleSetId } = await params;
  const scaleSetIdBigInt = BigInt(scaleSetId);

  let scaleSet, availableScales, years;
  try {
    [scaleSet, availableScales, years] = await Promise.all([
      getScaleSetById(scaleSetIdBigInt),
      getAllScales(),
      yearsApi.getAll(),
    ]);
  } catch (error) {
    notFound();
  }

  if (!scaleSet) {
    notFound();
  }

  return (
    <div className="w-full">
      <Link
        href="/admin"
        className="inline-flex items-center text-sm text-text-secondary hover:text-text-primary mb-4"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Admin Panel
      </Link>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Edit Scale Set</h1>
        <ScaleSetEditForm
          scaleSet={scaleSet}
          availableScales={availableScales}
          years={years}
        />
      </div>
    </div>
  );
}
