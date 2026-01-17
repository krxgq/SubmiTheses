import { yearsApi, type Year } from '@/lib/api/years';
import { ScaleSetCreateForm } from './ScaleSetCreateForm';
import { Link } from '@/lib/navigation';
import { ChevronLeft } from 'lucide-react';

// Server component wrapper for scale set creation - fetches years for dropdown
export default async function CreateScaleSetPage() {
  let years: Year[] = [];

  try {
    years = await yearsApi.getAll();
  } catch (error) {
    console.error('Error fetching years:', error);
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
      <h1 className="text-2xl font-bold text-text-primary mb-6">Create Scale Set</h1>
      <ScaleSetCreateForm years={years} />
    </div>
  );
}
