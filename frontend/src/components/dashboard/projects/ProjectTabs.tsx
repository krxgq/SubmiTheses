'use client';

import { useState } from 'react';
import AttachmentsTab from './AttachmentsTab';
import GradingForm from './GradingForm';
import GradesDisplay from './GradesDisplay';
import { useAuth } from '@/hooks/useAuth';
import type { ProjectWithRelations } from '@sumbi/shared-types';
import { useTranslations } from 'next-intl';

type TabKey = 'attachments' | 'links' | 'reviews' | 'grades';

interface ProjectTabsProps {
  projectId: string;
  project: ProjectWithRelations;
}

/**
 * Tab navigation for project detail sections
 * Client component with tab switching functionality
 * Lazy-loads tab content when selected
 */
export default function ProjectTabs({ projectId, project }: ProjectTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('attachments');
  const { user } = useAuth();
  const t = useTranslations('projectDetail.tabs');

  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';

  const tabs = [
    { key: 'attachments' as TabKey, label: t('attachments') },
    { key: 'links' as TabKey, label: t('externalLinks') },
    { key: 'reviews' as TabKey, label: t('reviews') },
    { key: 'grades' as TabKey, label: t('grades') }
  ];

  return (
    <div className="bg-background-elevated rounded-lg border border-border">
      {/* Tab Navigation */}
      <div className="border-b border-border overflow-x-auto">
        <nav className="flex gap-4 sm:gap-6 px-3 sm:px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                ${activeTab === tab.key
                  ? 'border-interactive-primary text-text-accent'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-strong'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-3 sm:p-6">
        {activeTab === 'attachments' && (
          <AttachmentsTab projectId={projectId} project={project} />
        )}

        {activeTab === 'links' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">{t('externalLinks')}</h3>
            {/* Placeholder for external links */}
            <div className="text-sm text-text-secondary bg-background-secondary rounded-lg p-8 text-center">
              {t('linksPlaceholder')}
              <br />
              <span className="text-xs">{t('linksDescription')}</span>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">{t('reviews')}</h3>
            {/* Placeholder for reviews */}
            <div className="text-sm text-text-secondary bg-background-secondary rounded-lg p-8 text-center">
              {t('reviewsPlaceholder')}
              <br />
              <span className="text-xs">{t('reviewsDescription')}</span>
            </div>
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">{t('grades')}</h3>

            {/* Teacher grading form - only for assigned teachers */}
            {isTeacher && project.year_id && (
              <GradingForm projectId={projectId} yearId={String(project.year_id)} />
            )}

            {/* Student/admin grade view */}
            {(isStudent || isAdmin) && (
              <GradesDisplay projectId={projectId} isStudent={isStudent} />
            )}

            {/* Fallback for unassigned users */}
            {!isTeacher && !isStudent && !isAdmin && (
              <div className="text-sm text-text-secondary bg-background-secondary rounded-lg p-8 text-center">
                {t('noGradesAccess')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
