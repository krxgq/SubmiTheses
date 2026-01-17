'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/lib/navigation';
import { Button } from 'flowbite-react';
import { Plus, MoreVertical } from 'lucide-react';
import type { Scale } from '@/lib/api/scales';
import { deleteScale } from '@/lib/api/scales';

interface ScalesTableProps {
  scales: Scale[];
}

// Client component for scales table with actions
export function ScalesTable({ scales }: ScalesTableProps) {
  const t = useTranslations('admin.scales');
  const router = useRouter();
  const [actionMenuOpen, setActionMenuOpen] = useState<bigint | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Calculate menu position when opening
  const handleMenuToggle = (scaleId: bigint) => {
    if (actionMenuOpen === scaleId) {
      setActionMenuOpen(null);
      setMenuPosition(null);
    } else {
      const button = buttonRefs.current.get(String(scaleId));
      if (button) {
        const rect = button.getBoundingClientRect();
        setMenuPosition({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right,
        });
      }
      setActionMenuOpen(scaleId);
    }
  };

  const handleDelete = async (id: bigint, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteScale(id);
      router.refresh();
    } catch (error) {
      alert('Failed to delete scale. It may be in use by grades or scale sets.');
      console.error(error);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>
        <Link href="/admin/scales/create">
          <Button size="sm" className="bg-primary hover:bg-primary-hover text-text-inverse px-6 py-2.5 rounded-lg font-medium transition-all">
            <Plus className="w-4 h-4 mr-2" />
            {t('create')}
          </Button>
        </Link>
      </div>

      {scales.length > 0 ? (
        <div className="bg-background-elevated rounded-xl shadow-sm border border-border overflow-visible">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-background-secondary border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-text-primary font-semibold">
                    {t('name')}
                  </th>
                  <th className="px-6 py-3 text-text-primary font-semibold">
                    {t('description')}
                  </th>
                  <th className="px-6 py-3 text-text-primary font-semibold">
                    {t('maxValue')}
                  </th>
                  <th className="px-6 py-3 text-text-primary font-semibold">Used In</th>
                  <th className="px-6 py-3 text-text-primary font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {scales.map((scale) => (
                  <tr
                    key={String(scale.id)}
                    className="hover:bg-background-hover transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-text-primary">
                      {scale.name}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {scale.desc || '-'}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {String(scale.maxVal)}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {(scale._count?.scale_set_scales || 0) + (scale._count?.grades || 0)} places
                    </td>
                    <td className="px-6 py-4">
                      <button
                        ref={(el) => {
                          if (el) buttonRefs.current.set(String(scale.id), el);
                        }}
                        onClick={() => handleMenuToggle(scale.id)}
                        className="p-1 hover:bg-background-hover rounded"
                      >
                        <MoreVertical className="w-5 h-5 text-text-secondary" />
                      </button>

                      {actionMenuOpen === scale.id && menuPosition && (
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
                              href={`/admin/scales/${scale.id}/edit`}
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
                                handleDelete(scale.id, scale.name);
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
            <p className="text-text-secondary">No scales found.</p>
          </div>
        </div>
      )}
    </div>
  );
}
