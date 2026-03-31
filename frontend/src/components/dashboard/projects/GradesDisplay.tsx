'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { projectsApi } from '@/lib/api/projects';
import { Award, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import type { ProjectWithRelations } from '@sumbi/shared-types';

interface GradesDisplayProps {
  projectId: string;
  isStudent: boolean;
  project: ProjectWithRelations;  // Needed to determine reviewer's project role
}

/**
 * GradesDisplay - Shows grades to students and admins
 * For students: Only visible after feedback_date
 * For admins: Always visible
 * Shows detailed breakdown grouped by reviewer
 */
export default function GradesDisplay({ projectId, isStudent, project }: GradesDisplayProps) {
  const t = useTranslations('projectDetail.grading');
  const tProjects = useTranslations('projects');
  const [grades, setGrades] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canView, setCanView] = useState(false);

  useEffect(() => {
    loadGrades();
  }, [projectId]);

  const loadGrades = async () => {
    try {
      setIsLoading(true);
      const data = await projectsApi.getAllGrades(projectId);
      setGrades(data);
      setCanView(true);
    } catch (error: any) {
      // Handle 403 error gracefully (before feedback_date)
      if (error.statusCode === 403 && error.code === 'GRADES_NOT_AVAILABLE') {
        setCanView(false);
      } else {
        toast.error(t('gradesLoadFailed'));
        console.error('Load error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show "Grading in Progress" if student can't view yet
  if (!canView) {
    return (
      <div className="p-8 bg-background-secondary rounded-lg text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-warning/10 rounded-full mb-4">
          <Award className="w-8 h-8 text-warning" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {t('gradingInProgress')}
        </h3>
        <p className="text-text-secondary">
          {t('gradesAvailableAfter')}
        </p>
      </div>
    );
  }

  // No grades submitted yet
  if (!grades || Object.keys(grades).length === 0) {
    return (
      <div className="p-8 bg-background-secondary rounded-lg text-center">
        <p className="text-text-secondary">{t('noGrades')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Display grades grouped by reviewer */}
      {Object.values(grades).map((reviewerData: any) => {
        const reviewer = reviewerData.reviewer;
        const reviewerGrades = reviewerData.grades;

        // Determine project role by matching reviewer ID to project assignments
        const isReviewerSupervisor = reviewer.id === project.supervisor_id;
        const projectRoleLabel = isReviewerSupervisor ? tProjects('supervisor') : tProjects('opponent');

        // Calculate weighted average for this reviewer
        let totalScore = 0;
        let totalMaxPoints = 0;

        reviewerGrades.forEach((grade: any) => {
          totalScore += Number(grade.value);
          totalMaxPoints += Number(grade.scales.maxVal);
        });

        const averagePercent = totalMaxPoints > 0
          ? ((totalScore / totalMaxPoints) * 100).toFixed(2)
          : '0.00';

        return (
          <div
            key={reviewer.id}
            className="p-6 bg-background-elevated border border-border rounded-lg"
          >
            {/* Reviewer header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">
                    {reviewer.first_name} {reviewer.last_name}
                  </h3>
                  <p className="text-sm text-text-secondary">{projectRoleLabel}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-text-secondary">{t('average')}</div>
                <div className="text-2xl font-bold text-primary">{averagePercent}%</div>
              </div>
            </div>

            {/* Individual scale grades */}
            <div className="space-y-3">
              {reviewerGrades.map((grade: any) => {
                const value = Number(grade.value);
                const maxVal = Number(grade.scales.maxVal);
                const percentage = maxVal > 0 ? ((value / maxVal) * 100).toFixed(1) : '0.0';

                return (
                  <div
                    key={grade.id}
                    className="flex items-center justify-between p-3 bg-background-secondary rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-text-primary">{grade.scales.name}</div>
                      {grade.scales.desc && (
                        <div className="text-sm text-text-secondary mt-1">
                          {grade.scales.desc}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-semibold text-text-primary">
                        {value} / {maxVal}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {percentage}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Posudek (written evaluation) — shown if the reviewer submitted one */}
            {reviewerData.posudek && (
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="font-semibold text-text-primary mb-2">{t('posudekTitle')}</h4>
                <div className="p-3 bg-background-secondary rounded-lg">
                  <MarkdownRenderer content={reviewerData.posudek} className="text-sm" />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
