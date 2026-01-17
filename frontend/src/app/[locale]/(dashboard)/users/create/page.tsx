import { Metadata } from 'next';
import UserCreateForm from './UserCreateForm';

export const metadata: Metadata = {
  title: 'Create User | Submit Theses',
};

// Server component - renders user creation page (admin only)
export default function CreateUserPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New User</h1>
      <UserCreateForm />
    </div>
  );
}
