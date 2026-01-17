import { getScaleById } from '@/lib/api/scales';
import { ScaleEditForm } from './ScaleEditForm';
import { Link } from '@/lib/navigation';
import { ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

interface EditScalePageProps {
  params: Promise<{ scaleId: string }>;
}

// Server component - fetches scale data and renders edit form
export default async function EditScalePage({ params }: EditScalePageProps) {
  const { scaleId } = await params;
  const scaleIdBigInt = BigInt(scaleId);

  let scale;
  try {
    scale = await getScaleById(scaleIdBigInt);
  } catch (error) {
    notFound();
  }

  if (!scale) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-8">
      <Link
        href="/admin"
        className="inline-flex items-center text-sm text-text-secondary hover:text-text-primary mb-4"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Admin Panel
      </Link>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Edit Scale</h1>
      <ScaleEditForm scale={scale} />
    </div>
  );
}
