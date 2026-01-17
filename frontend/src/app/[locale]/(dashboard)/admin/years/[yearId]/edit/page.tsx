import { getYearById } from '@/lib/api/years';
import { YearEditForm } from './YearEditForm';

interface PageProps {
  params: Promise<{ yearId: string }>;
}

// Server component - fetches year data for editing
export default async function EditYearPage({ params }: PageProps) {
  const { yearId } = await params;
  const year = await getYearById(BigInt(yearId));

  if (!year) {
    return (
      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-8">
        <div className="bg-danger/10 border border-danger/30 rounded-lg p-4">
          <p className="text-danger">Year not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-text-primary mb-8">
        Edit Year: {year.name || 'Unnamed'}
      </h1>

      <YearEditForm year={year} />
    </div>
  );
}
