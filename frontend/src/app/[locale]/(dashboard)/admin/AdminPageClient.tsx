'use client';

import { useState } from 'react';
import type { Subject } from '@/lib/api/subjects';
import type { Scale } from '@/lib/api/scales';
import type { ScaleSet } from '@/lib/api/scale-sets';
import type { Year } from '@/lib/api/years';
import { SubjectsTable } from './subjects/SubjectsTable';
import { ScalesTable } from './scales/ScalesTable';
import { ScaleSetsTable } from './scale-sets/ScaleSetsTable';
import { YearsTable } from './years/YearsTable';
import { useTranslations } from 'next-intl';

interface AdminPageClientProps {
  subjects: Subject[];
  scales: Scale[];
  scaleSets: ScaleSet[];
  years: Year[];
}

type TabKey = 'subjects' | 'scales' | 'scale-sets' | 'years';

// Client component - handles tab switching and renders appropriate table
export function AdminPageClient({ subjects, scales, scaleSets, years }: AdminPageClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('subjects');
  const t = useTranslations();

  const tabs = [
    { key: 'subjects' as TabKey, label: t('admin.subjects.title') },
    { key: 'scales' as TabKey, label: t('admin.scales.title') },
    { key: 'scale-sets' as TabKey, label: t('admin.scaleSets.title') },
    { key: 'years' as TabKey, label: t('admin.years.title') },
  ];

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-border mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Admin sections">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                  ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary hover:border-border hover:text-text-primary'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === 'subjects' && <SubjectsTable subjects={subjects} />}
        {activeTab === 'scales' && <ScalesTable scales={scales} />}
        {activeTab === 'scale-sets' && <ScaleSetsTable scaleSets={scaleSets} />}
        {activeTab === 'years' && <YearsTable years={years} />}
      </div>
    </div>
  );
}
