import CreateProjectModule from '@/components/dashboard/projects/createProject/createProject';

// Page wrapper for project creation with proper padding
export default function CreateProjectPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <CreateProjectModule />
    </div>
  );
}
