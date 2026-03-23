'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/lib/navigation';
import { Button as FlowbiteButton } from 'flowbite-react';
import { Plus, CheckSquare, X, Users, Loader2 } from 'lucide-react';
import { UserActionsMenu } from '@/components/dashboard/users/UserActionsMenu';
import { FilterMenu, UserFilters } from '@/components/dashboard/users/FilterMenu';
import { UserStatusIndicator } from '@/components/dashboard/users/UserStatusIndicator';
import { Button } from '@/components/ui/Button';
import { Modal, ModalActions } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { usersApi } from '@/lib/api/users';
import { getAllYears } from '@/lib/api/years';
import { toast } from 'sonner';
import type { UserWithYear, Year } from '@sumbi/shared-types';

interface UsersTableProps {
  users: (UserWithYear & { class?: string | null })[];
}

export function UsersTable({ users: initialUsers }: UsersTableProps) {
  const t = useTranslations('users');
  const router = useRouter();
  const [filters, setFilters] = useState<UserFilters>({});
  const [users, setUsers] = useState<UserWithYear[]>(initialUsers);

  // Sync local state when server component re-fetches (e.g. after router.refresh())
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  // Selection mode state
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAssigning, setIsAssigning] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedYearId, setSelectedYearId] = useState('');

  // Available years for the dropdown
  const [years, setYears] = useState<Year[]>([]);
  const [yearsLoading, setYearsLoading] = useState(false);

  // Ref for the select-all checkbox (supports indeterminate state)
  const selectAllRef = useRef<HTMLInputElement>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (filters.role && filters.role.length > 0 && !filters.role.includes(user.role)) {
        return false;
      }
      return true;
    });
  }, [users, filters]);

  // Sync indeterminate state on the select-all checkbox
  useEffect(() => {
    if (selectAllRef.current) {
      const allSelected = filteredUsers.length > 0 && filteredUsers.every(u => selectedIds.has(u.id));
      const someSelected = filteredUsers.some(u => selectedIds.has(u.id));
      selectAllRef.current.indeterminate = someSelected && !allSelected;
      selectAllRef.current.checked = allSelected;
    }
  }, [selectedIds, filteredUsers]);

  // Fetch years when modal opens
  useEffect(() => {
    if (!showAssignModal) return;
    setYearsLoading(true);
    getAllYears()
      .then(setYears)
      .catch(() => setYears([]))
      .finally(() => setYearsLoading(false));
  }, [showAssignModal]);

  const handleFilterChange = (newFilters: UserFilters) => {
    setFilters(newFilters);
  };

  const handleUserDeleted = (userId: string) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
  };

  // Toggle single user selection
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Select/deselect all visible (filtered) users
  const toggleSelectAll = useCallback(() => {
    setSelectedIds(prev => {
      const allSelected = filteredUsers.every(u => prev.has(u.id));
      if (allSelected) {
        const next = new Set(prev);
        filteredUsers.forEach(u => next.delete(u.id));
        return next;
      } else {
        const next = new Set(prev);
        filteredUsers.forEach(u => next.add(u.id));
        return next;
      }
    });
  }, [filteredUsers]);

  // Exit select mode and clear selection
  const exitSelectMode = useCallback(() => {
    setSelectMode(false);
    setSelectedIds(new Set());
  }, []);

  // Calls the bulk-assign-year API, then refreshes server data to re-render the table
  const handleBulkAssignYear = useCallback(async () => {
    if (!selectedYearId) return;

    const yearId = selectedYearId === 'clear' ? null : parseInt(selectedYearId);

    setIsAssigning(true);
    try {
      const result = await usersApi.bulkAssignYear(Array.from(selectedIds), yearId);

      toast.success(t('bulkAssignYearSuccess', { count: result.updated }));
      setShowAssignModal(false);
      setSelectedYearId('');
      exitSelectMode();

      // Re-run the server component to fetch fresh user data (bypasses browser cache)
      router.refresh();
    } catch {
      toast.error(t('bulkAssignYearFailed'));
    } finally {
      setIsAssigning(false);
    }
  }, [selectedIds, selectedYearId, exitSelectMode, t, router]);

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">
          {t('title')}
        </h1>
        <div className="flex items-center gap-3">
          {/* Toggle between Select and Cancel buttons */}
          {selectMode ? (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<X size={16} />}
              onClick={exitSelectMode}
            >
              {t('cancelSelection')}
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<CheckSquare size={16} />}
              onClick={() => setSelectMode(true)}
            >
              {t('selectUsers')}
            </Button>
          )}
          {/* Hide Create User button during select mode */}
          {!selectMode && (
            <Link href="/users/create">
              <FlowbiteButton size="sm" className="bg-primary hover:bg-primary-hover text-text-inverse px-6 py-2.5 rounded-lg font-medium transition-all">
                <Plus className="w-4 h-4 mr-2" />
                Create User
              </FlowbiteButton>
            </Link>
          )}
          <FilterMenu onFilterChange={handleFilterChange} />
        </div>
      </div>

      {filteredUsers.length > 0 ? (
        <div className="bg-background-elevated rounded-xl shadow-sm border border-border overflow-visible">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-background-secondary border-b border-border sticky top-0 z-10">
                <tr>
                  {/* Checkbox column header — only in select mode */}
                  {selectMode && (
                    <th className="px-4 py-3 bg-background-secondary w-10">
                      <input
                        ref={selectAllRef}
                        type="checkbox"
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-border text-interactive-primary focus:ring-interactive-primary/20 cursor-pointer"
                      />
                    </th>
                  )}
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
                    className={`hover:bg-background-hover transition-colors ${
                      selectMode && selectedIds.has(user.id) ? 'bg-interactive-primary/5' : ''
                    }`}
                  >
                    {/* Checkbox cell — only in select mode */}
                    {selectMode && (
                      <td className="px-4 py-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(user.id)}
                          onChange={() => toggleSelect(user.id)}
                          className="w-4 h-4 rounded border-border text-interactive-primary focus:ring-interactive-primary/20 cursor-pointer"
                        />
                      </td>
                    )}
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
                        emailVerified={user.email_verified}
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

      {/* Floating action bar — visible when users are selected */}
      {selectMode && selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-background-elevated border border-border-strong rounded-2xl shadow-lg px-6 py-3 flex items-center gap-4">
          <span className="text-sm font-medium text-text-primary">
            {t('selectedCount', { count: selectedIds.size })}
          </span>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Users size={16} />}
            onClick={() => setShowAssignModal(true)}
          >
            {t('assignToYear')}
          </Button>
        </div>
      )}

      {/* Assign to Year modal — dropdown of available academic years */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title={t('assignToYearTitle')}
        description={t('assignToYearDescription')}
        size="sm"
        footer={
          <ModalActions>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAssignModal(false)}
              disabled={isAssigning}
            >
              {t('cancelSelection')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={isAssigning ? <Loader2 size={16} className="animate-spin" /> : undefined}
              onClick={handleBulkAssignYear}
              disabled={isAssigning || yearsLoading}
            >
              {t('assignToYear')}
            </Button>
          </ModalActions>
        }
      >
        <Select
          id="year-select"
          label={t('yearLabel')}
          value={selectedYearId}
          onChange={setSelectedYearId}
          placeholder={yearsLoading ? '...' : t('selectYear')}
          disabled={yearsLoading}
          options={[
            // "Clear" option to unassign year
            { value: 'clear', label: `— ${t('clearYear')} —` },
            ...years.map(y => ({
              value: String(y.id),
              label: y.name || String(y.id),
            })),
          ]}
        />
      </Modal>
    </div>
  );
}
