'use client';

import { useState, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/lib/navigation';
import { Button } from 'flowbite-react';
import { Plus, MoreVertical } from 'lucide-react';
import type { ScaleSet } from '@/lib/api/scale-sets';
import { deleteScaleSet } from '@/lib/api/scale-sets';

interface ScaleSetsTableProps {
  scaleSets: ScaleSet[];
}

// Client component for scale sets table with filtering and actions
export function ScaleSetsTable({ scaleSets }: ScaleSetsTableProps) {
  const t = useTranslations('admin.scaleSets');
  const router = useRouter();
  const [roleFilter, setRoleFilter] = useState<'all' | 'supervisor' | 'opponent'>('all');
  const [actionMenuOpen, setActionMenuOpen] = useState<bigint | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const filteredScaleSets = useMemo(() => {
    return scaleSets.filter((scaleSet) => {
      if (roleFilter === 'all') return true;
      return scaleSet.project_role === roleFilter;
    });
  }, [scaleSets, roleFilter]);

  // Calculate menu position when opening
  const handleMenuToggle = (scaleSetId: bigint) => {
    if (actionMenuOpen === scaleSetId) {
      setActionMenuOpen(null);
      setMenuPosition(null);
    } else {
      const button = buttonRefs.current.get(String(scaleSetId));
      if (button) {
        const rect = button.getBoundingClientRect();
        setMenuPosition({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right,
        });
      }
      setActionMenuOpen(scaleSetId);
    }
  };

  const handleDelete = async (id: bigint, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteScaleSet(id);
      router.refresh();
    } catch (error) {
      alert('Failed to delete scale set.');
      console.error(error);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>
        <div className="flex items-center gap-3">
          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="rounded-lg border border-border bg-background-elevated px-3 py-2 text-sm text-text-primary"
          >
            <option value="all">All Roles</option>
            <option value="supervisor">Supervisor</option>
            <option value="opponent">Opponent</option>
          </select>

          <Link href="/admin/scale-sets/create">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              {t('create')}
            </Button>
          </Link>
        </div>
      </div>

      {filteredScaleSets.length > 0 ? (
        <div className="bg-background-elevated rounded-xl shadow-sm border border-border overflow-visible">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-background-secondary border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-text-primary font-semibold">
                    {t('name')}
                  </th>
                  <th className="px-6 py-3 text-text-primary font-semibold">
                    {t('year')}
                  </th>
                  <th className="px-6 py-3 text-text-primary font-semibold">
                    {t('role')}
                  </th>
                  <th className="px-6 py-3 text-text-primary font-semibold"># Scales</th>
                  <th className="px-6 py-3 text-text-primary font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredScaleSets.map((scaleSet) => (
                  <tr
                    key={String(scaleSet.id)}
                    className="hover:bg-background-hover transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-text-primary">
                      {scaleSet.name}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {scaleSet.years?.name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          scaleSet.project_role === 'supervisor'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {scaleSet.project_role === 'supervisor' ? t('supervisor') : t('opponent')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {scaleSet._count?.scale_set_scales || scaleSet.scale_set_scales?.length || 0}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        ref={(el) => {
                          if (el) buttonRefs.current.set(String(scaleSet.id), el);
                        }}
                        onClick={() => handleMenuToggle(scaleSet.id)}
                        className="p-1 hover:bg-background-hover rounded"
                      >
                        <MoreVertical className="w-5 h-5 text-text-secondary" />
                      </button>

                      {actionMenuOpen === scaleSet.id && menuPosition && (
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
                              href={`/admin/scale-sets/${scaleSet.id}/edit`}
                              className="block px-4 py-2 text-sm text-text-primary hover:bg-background-hover"
                              onClick={() => {
                                setActionMenuOpen(null);
                                setMenuPosition(null);
                              }}
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => {
                                handleDelete(scaleSet.id, scaleSet.name);
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
            <p className="text-text-secondary">No scale sets found.</p>
          </div>
        </div>
      )}
    </div>
  );
}
