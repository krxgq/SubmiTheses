import { SubjectCreateForm } from './SubjectCreateForm';
import { Link } from '@/lib/navigation';
import { ChevronLeft } from 'lucide-react';

// Server component wrapper for subject creation
export default function CreateSubjectPage() {
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
        <h1 className="text-2xl font-bold text-text-primary mb-6">Create Subject</h1>
        <SubjectCreateForm />
      </div>
    </div>
  );
}
