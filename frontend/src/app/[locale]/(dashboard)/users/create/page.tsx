import { Metadata } from 'next';
import UserCreateForm from './UserCreateForm';

export const metadata: Metadata = {
  title: 'Create User | Submit Theses',
};

// Server component - renders user creation page (admin only)
export default function CreateUserPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create New User</h1>
      <UserCreateForm />
    </div>
  );
}
