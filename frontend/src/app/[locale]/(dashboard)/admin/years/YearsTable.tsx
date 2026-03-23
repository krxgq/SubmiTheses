'use client';

import { useState, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/lib/navigation';
import { Button } from 'flowbite-react';
import { Plus, MoreVertical, Copy } from 'lucide-react';
import type { Year } from '@/lib/api/years';
import { deleteYear } from '@/lib/api/years';

interface YearsTableProps {
  years: Year[];
}

// Helper to determine year status based on dates
function getYearStatus(year: Year): 'current' | 'past' | 'future' {
  if (!year.assignment_date || !year.feedback_date) return 'future';

  const now = new Date();
  const assignmentDate = new Date(year.assignment_date);
  const feedbackDate = new Date(year.feedback_date);

  if (now >= assignmentDate && now <= feedbackDate) return 'current';
  if (now > feedbackDate) return 'past';
  return 'future';
}

// Format date for display
function formatDate(date: string | Date | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString();
}

// Client component for years table with actions
export function YearsTable({ years }: YearsTableProps) {
  const t = useTranslations('admin.years');
  const router = useRouter();
  const [actionMenuOpen, setActionMenuOpen] = useState<bigint | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const sortedYears = useMemo(() => {
    return [...years].sort((a, b) => {
      const dateA = a.assignment_date ? new Date(a.assignment_date).getTime() : 0;
      const dateB = b.assignment_date ? new Date(b.assignment_date).getTime() : 0;
      return dateB - dateA; // Most recent first
    });
  }, [years]);

  // Calculate menu position when opening
  const handleMenuToggle = (yearId: bigint) => {
    if (actionMenuOpen === yearId) {
      setActionMenuOpen(null);
      setMenuPosition(null);
    } else {
      const button = buttonRefs.current.get(String(yearId));
      if (button) {
        const rect = button.getBoundingClientRect();
        setMenuPosition({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right,
        });
      }
      setActionMenuOpen(yearId);
    }
  };

  const handleDelete = async (id: bigint, name: string | null) => {
    const yearName = name || 'this year';
    if (!confirm(`Are you sure you want to delete "${yearName}"? This will affect all related projects and grades.`)) {
      return;
    }

    try {
      await deleteYear(id);
      router.refresh();
    } catch (error) {
      alert('Failed to delete year. It may be in use by projects.');
      console.error(error);
    }
  };

  // Find the most recent year for cloning
  const mostRecentYear = sortedYears[0];

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>
        <div className="flex items-center gap-3">
          {mostRecentYear && (
            <Link href={`/admin/years/create?cloneFrom=${mostRecentYear.id}`}>
              <Button size="sm" className="bg-primary hover:bg-primary-hover text-text-inverse px-6 py-2.5 rounded-lg font-medium transition-all flex items-center">
                <Copy className="w-4 h-4 mr-2" />
                {t('createNextYear')}
              </Button>
            </Link>
          )}

          <Link href="/admin/years/create">
            <Button size="sm" className="bg-primary hover:bg-primary-hover text-text-inverse px-6 py-2.5 rounded-lg font-medium transition-all flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              {t('create')}
            </Button>
          </Link>
        </div>
      </div>

      {sortedYears.length > 0 ? (
        <div className="bg-background-elevated rounded-xl shadow-sm border border-border overflow-visible">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-background-secondary border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-text-primary font-semibold">Name</th>
                  <th className="px-6 py-3 text-text-primary font-semibold">Assignment Date</th>
                  <th className="px-6 py-3 text-text-primary font-semibold">Submission Date</th>
                  <th className="px-6 py-3 text-text-primary font-semibold">Feedback Date</th>
                  <th className="px-6 py-3 text-text-primary font-semibold">Status</th>
                  <th className="px-6 py-3 text-text-primary font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedYears.map((year) => {
                  const status = getYearStatus(year);
                  return (
                    <tr
                      key={String(year.id)}
                      className="hover:bg-background-hover transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-text-primary">
                        {year.name || <span className="text-text-secondary italic">Unnamed</span>}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {formatDate(year.assignment_date)}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {formatDate(year.submission_date)}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {formatDate(year.feedback_date)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            status === 'current'
                              ? 'bg-success/10 text-success dark:bg-success/10 dark:text-success'
                              : status === 'past'
                              ? 'bg-background-secondary text-text-secondary'
                              : 'bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary'
                          }`}
                        >
                          {status === 'current' ? 'Active' : status === 'past' ? 'Past' : 'Future'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          ref={(el) => {
                            if (el) buttonRefs.current.set(String(year.id), el);
                          }}
                          onClick={() => handleMenuToggle(year.id)}
                          className="p-1 hover:bg-background-hover rounded"
                        >
                          <MoreVertical className="w-5 h-5 text-text-secondary" />
                        </button>

                        {actionMenuOpen === year.id && menuPosition && (
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
                                href={`/admin/years/${year.id}/edit`}
                                className="block px-4 py-2 text-sm text-text-primary hover:bg-background-hover"
                                onClick={() => {
                                  setActionMenuOpen(null);
                                  setMenuPosition(null);
                                }}
                              >
                                Edit
                              </Link>
                              <Link
                                href={`/admin/years/create?cloneFrom=${year.id}`}
                                className="block px-4 py-2 text-sm text-text-primary hover:bg-background-hover"
                                onClick={() => {
                                  setActionMenuOpen(null);
                                  setMenuPosition(null);
                                }}
                              >
                                Clone Year
                              </Link>
                              <button
                                onClick={() => {
                                  handleDelete(year.id, year.name);
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-background-elevated rounded-xl shadow-sm border border-border p-12">
          <div className="text-center">
            <p className="text-text-secondary mb-4">No academic years found.</p>
          </div>
        </div>
      )}
    </div>
  );
}
