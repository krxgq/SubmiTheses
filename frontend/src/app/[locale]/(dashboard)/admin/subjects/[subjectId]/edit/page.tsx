import { getSubjectById } from '@/lib/api/subjects';
import { SubjectEditForm } from './SubjectEditForm';
import { Link } from '@/lib/navigation';
import { ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

interface EditSubjectPageProps {
  params: Promise<{ subjectId: string }>;
}

// Server component - fetches subject data and renders edit form
export default async function EditSubjectPage({ params }: EditSubjectPageProps) {
  const { subjectId } = await params;
  const subjectIdBigInt = BigInt(subjectId);

  let subject;
  try {
    subject = await getSubjectById(subjectIdBigInt);
  } catch (error) {
    notFound();
  }

  if (!subject) {
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
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Edit Subject</h1>
        <SubjectEditForm subject={subject} />
      </div>
    </div>
  );
}
