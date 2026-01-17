'use client';

import { useState, useEffect } from 'react';
import type { ProjectWithRelations } from '@sumbi/shared-types';
import { projectsApi } from '@/lib/api/projects';
import { Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface QuickStatsProps {
  project: ProjectWithRelations;
  // Future: will be populated from related entities
  attachmentsCount?: number;
  reviewsCount?: number;
  linksCount?: number;
}

/**
 * Quick stats sidebar showing project metrics
 * Displays counts for attachments, reviews, grades, and key dates
 */
export default function QuickStats({
  project,
  attachmentsCount = 4,
  reviewsCount = 3,
  linksCount = 2
}: QuickStatsProps) {
  const t = useTranslations('projectDetail.quickStats');
  const [gradeStatus, setGradeStatus] = useState<string>(t('pending'));
  const [isLoadingGrades, setIsLoadingGrades] = useState(true);

  // Fetch grade status on mount
  useEffect(() => {
    loadGradeStatus();
  }, [project.id]);

  const loadGradeStatus = async () => {
    try {
      const grades = await projectsApi.getAllGrades(String(project.id));
      const reviewerCount = Object.keys(grades).length;

      if (reviewerCount > 0) {
        setGradeStatus(t('reviewCount', { count: reviewerCount }));
      } else {
        setGradeStatus(t('pending'));
      }
    } catch (error: any) {
      // If grades not available (403), show "In Progress"
      if (error.code === 'GRADES_NOT_AVAILABLE') {
        setGradeStatus(t('inProgress'));
      } else {
        setGradeStatus(t('pending'));
      }
    } finally {
      setIsLoadingGrades(false);
    }
  };
  // Format date helper
  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-background-elevated rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">{t('title')}</h3>

      <div className="space-y-4">
        {/* Total Attachments */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">{t('totalAttachments')}</span>
          <span className="text-sm font-semibold text-text-primary">{attachmentsCount}</span>
        </div>

        {/* Reviews */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">{t('reviews')}</span>
          <span className="text-sm font-semibold text-text-primary">{reviewsCount}</span>
        </div>

        {/* External Links */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">{t('externalLinks')}</span>
          <span className="text-sm font-semibold text-text-primary">{linksCount}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-4"></div>

        {/* Current Grade - Shows actual grade status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">{t('currentGrade')}</span>
          {isLoadingGrades ? (
            <div className="animate-pulse h-6 w-16 bg-background-secondary rounded" />
          ) : (
            <span className={`px-2 py-1 text-xs font-medium rounded ${
              gradeStatus === t('pending')
                ? 'bg-background-secondary text-warning'
                : 'bg-success/10 text-success'
            }`}>
              {gradeStatus}
            </span>
          )}
        </div>

        {/* Submission Date - Using updated_at as placeholder */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">{t('submissionDate')}</span>
          <span className="text-sm font-semibold text-text-primary">
            Dec 15, 2024
          </span>
        </div>

        {/* Last Updated */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">{t('lastUpdated')}</span>
          <span className="text-sm font-semibold text-text-primary">
            {formatDate(project.updated_at)}
          </span>
        </div>

        {/* Lock status indicator */}
        {project.status === 'locked' && (
          <>
            <div className="border-t border-border my-4"></div>
            <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning rounded-lg">
              <Lock className="w-4 h-4 text-warning flex-shrink-0" />
              <span className="text-sm text-warning font-medium">{t('locked')}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
