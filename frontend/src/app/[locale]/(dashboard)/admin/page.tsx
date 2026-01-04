import { getAllSubjects } from '@/lib/api/subjects';
import { getAllScales } from '@/lib/api/scales';
import { getAllScaleSets } from '@/lib/api/scale-sets';
import { getAllYears } from '@/lib/api/years';
import { AdminPageClient } from './AdminPageClient';
import type { Subject } from '@/lib/api/subjects';
import type { Scale } from '@/lib/api/scales';
import type { ScaleSet } from '@/lib/api/scale-sets';
import type { Year } from '@/lib/api/years';

// Server Component - fetches all data for admin panel
export default async function AdminPage() {
  let subjects: Subject[] = [];
  let scales: Scale[] = [];
  let scaleSets: ScaleSet[] = [];
  let years: Year[] = [];

  try {
    [subjects, scales, scaleSets, years] = await Promise.all([
      getAllSubjects(),
      getAllScales(),
      getAllScaleSets(),
      getAllYears(),
    ]);
  } catch (error) {
    console.error('[AdminPage] Error fetching data:', error);
  }

  return <AdminPageClient subjects={subjects} scales={scales} scaleSets={scaleSets} years={years} />;
}
