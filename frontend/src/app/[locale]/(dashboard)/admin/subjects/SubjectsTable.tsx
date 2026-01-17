'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/lib/navigation';
import { Button } from 'flowbite-react';
import { Plus, MoreVertical } from 'lucide-react';
import type { Subject } from '@/lib/api/subjects';
import { deleteSubject, deactivateSubject } from '@/lib/api/subjects';

interface SubjectsTableProps {
  subjects: Subject[];
}

// Client component for subjects table with filtering and actions
export function SubjectsTable({ subjects }: SubjectsTableProps) {
  const t = useTranslations('admin.subjects');
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [actionMenuOpen, setActionMenuOpen] = useState<bigint | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      if (filter === 'active') return subject.is_active;
      if (filter === 'inactive') return !subject.is_active;
      return true;
    });
  }, [subjects, filter]);

  // Calculate menu position when opening
  const handleMenuToggle = (subjectId: bigint) => {
    if (actionMenuOpen === subjectId) {
      setActionMenuOpen(null);
      setMenuPosition(null);
    } else {
      const button = buttonRefs.current.get(String(subjectId));
      if (button) {
        const rect = button.getBoundingClientRect();
        setMenuPosition({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right,
        });
      }
      setActionMenuOpen(subjectId);
    }
  };

  const handleDelete = async (id: bigint, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteSubject(id);
      router.refresh();
    } catch (error) {
      alert('Failed to delete subject. It may be in use by projects.');
      console.error(error);
    }
  };

  const handleDeactivate = async (id: bigint) => {
    try {
      await deactivateSubject(id);
      router.refresh();
    } catch (error) {
      alert('Failed to deactivate subject.');
      console.error(error);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>
        <div className="flex items-center gap-3">
          {/* Filter dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="rounded-lg border border-border bg-background-elevated px-3 py-2 text-sm text-text-primary"
          >
            <option value="all">All Subjects</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <Link href="/admin/subjects/create">
            <Button size="sm" className="flex items-center bg-primary text-text-inverse hover:bg-primary">
              <Plus className="w-4 h-4 mr-2" />
              {t('create')}
            </Button>
          </Link>
        </div>
      </div>

      {filteredSubjects.length > 0 ? (
        <div className="bg-background-elevated rounded-xl shadow-sm border border-border overflow-visible">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-background-secondary border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-text-primary font-semibold">
                    Name
                  </th>
                  <th className="px-6 py-3 text-text-primary font-semibold">Status</th>
                  <th className="px-6 py-3 text-text-primary font-semibold">Projects</th>
                  <th className="px-6 py-3 text-text-primary font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSubjects.map((subject) => (
                  <tr
                    key={String(subject.id)}
                    className="hover:bg-background-hover transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-text-primary">
                      {subject.name}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          subject.is_active
                            ? 'bg-success/10 text-success dark:bg-success/10 dark:text-success'
                            : 'bg-background-secondary text-text-secondary'
                        }`}
                      >
                        {subject.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {subject._count?.projects || 0}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        ref={(el) => {
                          if (el) buttonRefs.current.set(String(subject.id), el);
                        }}
                        onClick={() => handleMenuToggle(subject.id)}
                        className="p-1 hover:bg-background-hover rounded"
                      >
                        <MoreVertical className="w-5 h-5 text-text-secondary" />
                      </button>

                      {actionMenuOpen === subject.id && menuPosition && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => {
                              setActionMenuOpen(null);
                              setMenuPosition(null);
                            }}
                          />
                          <div
                            className="fixed w-48 bg-background-elevated border border-border rounded-lg shadow-xl z-20"
                            style={{ top: `${menuPosition.top}px`, right: `${menuPosition.right}px` }}
                          >
                            <Link
                              href={`/admin/subjects/${subject.id}/edit`}
                              className="block px-4 py-2 text-sm text-text-primary hover:bg-background-hover"
                              onClick={() => {
                                setActionMenuOpen(null);
                                setMenuPosition(null);
                              }}
                            >
                              Edit
                            </Link>
                            {subject.is_active && (
                              <button
                                onClick={() => {
                                  handleDeactivate(subject.id);
                                  setActionMenuOpen(null);
                                  setMenuPosition(null);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-hover"
                              >
                                Deactivate
                              </button>
                            )}
                            <button
                              onClick={() => {
                                handleDelete(subject.id, subject.name);
                                setActionMenuOpen(null);
                                setMenuPosition(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
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
            <p className="text-text-secondary">No subjects found.</p>
          </div>
        </div>
      )}
    </div>
  );
}
