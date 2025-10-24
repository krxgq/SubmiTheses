import { getDictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n-config';

interface ProjectsPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Projects</h1>
      <p className="text-secondary">Projects page content coming soon...</p>
    </div>
  );
}
