import { projectsApiServer } from '@/lib/api/projects';
import { ApiError } from '@/lib/api/client';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import EditProjectForm from '@/components/dashboard/projects/EditProjectForm';

interface EditProjectPageProps {
  params: Promise<{ locale: string; projectid: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { locale, projectid } = await params;
  setRequestLocale(locale);

  let project;
  try {
    project = await projectsApiServer.getProjectById(projectid);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 403) {
      return null; // AccessDenied will show
    }
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EditProjectForm project={project} />
      </div>
    </div>
  );
}
