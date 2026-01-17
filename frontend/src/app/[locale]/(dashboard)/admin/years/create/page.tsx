import { getAllYears, getYearScaleSetsForClone } from '@/lib/api/years';
import { YearCreateForm } from './YearCreateForm';

interface PageProps {
  searchParams: Promise<{ cloneFrom?: string }>;
}

// Server component - fetches data for year creation/cloning
export default async function CreateYearPage({ searchParams }: PageProps) {
  const { cloneFrom } = await searchParams;
  const years = await getAllYears();

  let cloneSourceScaleSets = null;
  let cloneSourceYear = null;

  if (cloneFrom) {
    try {
      const sourceYearId = BigInt(cloneFrom);
      cloneSourceYear = years.find((y) => y.id === sourceYearId);
      cloneSourceScaleSets = await getYearScaleSetsForClone(sourceYearId);
    } catch (error) {
      console.error('Failed to fetch clone source:', error);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-text-primary mb-8">
        {cloneSourceYear ? `Clone Year: ${cloneSourceYear.name}` : 'Create New Academic Year'}
      </h1>

      <YearCreateForm
        cloneSourceYear={cloneSourceYear}
        cloneSourceScaleSets={cloneSourceScaleSets}
      />
    </div>
  );
}
