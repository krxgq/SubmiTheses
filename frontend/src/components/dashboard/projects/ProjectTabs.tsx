'use client';

import { useState } from 'react';
import AttachmentsTab from './AttachmentsTab';
import ExternalLinksTab from './ExternalLinksTab';
import GradingForm from './GradingForm';
import GradesDisplay from './GradesDisplay';
import { useAuth } from '@/hooks/useAuth';
import type { ProjectWithRelations } from '@sumbi/shared-types';
import { useTranslations } from 'next-intl';

type TabKey = 'attachments' | 'links' | 'grades';

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

  // Check if user is assigned to this project as supervisor or opponent
  const isSupervisor = user?.id === project.supervisor_id;
  const isOpponent = user?.id === project.opponent_id;
  const isAssignedTeacher = isTeacher && (isSupervisor || isOpponent);

  // Admins can also grade if they're assigned as supervisor/opponent
  const canGrade = isAssignedTeacher || (isAdmin && (isSupervisor || isOpponent));

  const tabs = [
    { key: 'attachments' as TabKey, label: t('attachments') },
    { key: 'links' as TabKey, label: t('externalLinks') },
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
          <ExternalLinksTab projectId={projectId} project={project} />
        )}

        {activeTab === 'grades' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">{t('grades')}</h3>

            {/* Grading form - for assigned teachers or admins who are supervisor/opponent */}
            {canGrade && project.year_id && (
              <GradingForm
                projectId={projectId}
                yearId={String(project.year_id)}
                projectRole={isSupervisor ? 'supervisor' : 'opponent'}
              />
            )}

            {/* Message for teachers not assigned to this project */}
            {isTeacher && !isAssignedTeacher && (
              <div className="p-6 bg-background-secondary rounded-lg text-center">
                <p className="text-text-secondary">{t('notAssignedToGrade')}</p>
              </div>
            )}

            {/* Student view or admin view (when not grading) */}
            {(isStudent || (isAdmin && !canGrade)) && (
              <GradesDisplay projectId={projectId} isStudent={isStudent} project={project} />
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
