'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { Button } from 'flowbite-react';
import { Plus } from 'lucide-react';
import { UserActionsMenu } from '@/components/dashboard/users/UserActionsMenu';
import { FilterMenu, UserFilters } from '@/components/dashboard/users/FilterMenu';
import { UserStatusIndicator } from '@/components/dashboard/users/UserStatusIndicator';
import type { UserWithYear } from '@sumbi/shared-types';

interface UsersTableProps {
  users: (UserWithYear & { class?: string | null })[];
}

export function UsersTable({ users: initialUsers }: UsersTableProps) {
  const t = useTranslations('users');
  const [filters, setFilters] = useState<UserFilters>({});
  const [users, setUsers] = useState<UserWithYear[]>(initialUsers);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (filters.role && filters.role.length > 0 && !filters.role.includes(user.role)) {
        return false;
      }
      return true;
    });
  }, [users, filters]);

  const handleFilterChange = (newFilters: UserFilters) => {
    setFilters(newFilters);
  };

  // Handler to remove user from local state after deletion
  const handleUserDeleted = (userId: string) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">
          {t('title')}
        </h1>
        <div className="flex items-center gap-3">
          <Link href="/users/create">
            <Button size="sm" className="bg-primary hover:bg-primary-hover text-text-inverse px-6 py-2.5 rounded-lg font-medium transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </Link>
          <FilterMenu onFilterChange={handleFilterChange} />
        </div>
      </div>

      {filteredUsers.length > 0 ? (
        <div className="bg-background-elevated rounded-xl shadow-sm border border-border overflow-visible">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-background-secondary border-b border-border sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-text-primary font-semibold bg-background-secondary">
                    {t('table.name')}
                  </th>
                  <th className="px-6 py-3 text-text-primary font-semibold bg-background-secondary">
                    {t('table.email')}
                  </th>
                  <th className="px-6 py-3 text-text-primary font-semibold bg-background-secondary">
                    {t('table.role')}
                  </th>
                  <th className="px-6 py-3 text-text-primary font-semibold bg-background-secondary">
                    {t('table.year')}
                  </th>
                  <th className="px-6 py-3 text-text-primary font-semibold bg-background-secondary">
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-background-hover transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-text-primary">
                      <div className="flex items-center gap-2">
                        <span>{[user.first_name, user.last_name].filter(Boolean).join(' ') || 'N/A'}</span>
                        <UserStatusIndicator emailVerified={user.email_verified} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {t(`roles.${user.role}`)}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {user.role === 'student'
                        ? `${user.years?.name || ''} ${user.class ? `(${user.class})` : ''}`.trim() || 'N/A'
                        : ''}
                    </td>
                    <td className="px-6 py-4">
                      <UserActionsMenu
                        userId={user.id}
                        onUserDeleted={() => handleUserDeleted(user.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-background-elevated rounded-xl shadow-sm border border-border p-12">
          <div className="text-center">
            <p className="text-text-secondary">No users found</p>
          </div>
        </div>
      )}
    </div>
  );
}
