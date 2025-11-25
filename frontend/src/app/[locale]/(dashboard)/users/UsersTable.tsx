'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { UserActionsMenu } from '@/components/dashboard/users/UserActionsMenu';
import { FilterMenu, UserFilters } from '@/components/dashboard/users/FilterMenu';
import type { UserWithYear } from '@sumbi/shared-types';

interface UsersTableProps {
  users: UserWithYear[];
}

export function UsersTable({ users }: UsersTableProps) {
  const t = useTranslations('users');
  const [filters, setFilters] = useState<UserFilters>({});

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

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">
          {t('title')}
        </h1>
        <FilterMenu onFilterChange={handleFilterChange} />
      </div>

      {filteredUsers.length > 0 ? (
        <div className="bg-background-elevated rounded-xl shadow-sm border border-border overflow-visible">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-background-secondary border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-text-primary font-semibold">
                    {t('table.name')}
                  </th>
                  <th className="px-6 py-3 text-text-primary font-semibold">
                    {t('table.email')}
                  </th>
                  <th className="px-6 py-3 text-text-primary font-semibold">
                    {t('table.role')}
                  </th>
                  <th className="px-6 py-3 text-text-primary font-semibold">
                    {t('table.year')}
                  </th>
                  <th className="px-6 py-3 text-text-primary font-semibold">
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
                      {user.full_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {t(`roles.${user.role}`)}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {user.year?.id || user.year_id || 'N/A'}
                    </td>
                    <td className="px-6 py-4 relative">
                      <UserActionsMenu userId={user.id} />
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
