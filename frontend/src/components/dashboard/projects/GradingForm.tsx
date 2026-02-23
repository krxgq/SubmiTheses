'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { projectsApi } from '@/lib/api/projects';
import { Save, Calculator, UserCheck, CheckCircle, AlertCircle, Clock, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';

// Grading status returned from backend
interface GradingStatus {
  canSubmit: boolean;
  projectStatus: string;
  feedbackDate: string | null;
  isBeforeDeadline: boolean;
}

interface GradingFormProps {
  projectId: string;
  yearId: string;
  projectRole: 'supervisor' | 'opponent';  // Teacher's role on this specific project
}

/**
 * GradingForm - Teacher grading interface
 * Fetches scale set based on teacher's role (supervisor/opponent)
 * Implements blind grading (teacher only sees their own grades)
 */
export default function GradingForm({ projectId, yearId, projectRole }: GradingFormProps) {
  const t = useTranslations('projectDetail.grading');
  const tProjects = useTranslations('projects');
  const [scaleSet, setScaleSet] = useState<any>(null);
  const [existingGrades, setExistingGrades] = useState<any[]>([]);
  const [gradeValues, setGradeValues] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSubmittedGrades, setHasSubmittedGrades] = useState(false);
  const [gradingStatus, setGradingStatus] = useState<GradingStatus | null>(null);

  // Load scale set and existing grades on mount
  useEffect(() => {
    loadGradingData();
  }, [projectId]);

  const loadGradingData = async () => {
    try {
      setIsLoading(true);
      const [scaleSetData, gradesData] = await Promise.all([
        projectsApi.getScaleSetForGrading(projectId),
        projectsApi.getMyGrades(projectId)
      ]);

      setScaleSet(scaleSetData);
      setExistingGrades(gradesData);

      // Extract grading status from scale set response
      if (scaleSetData?.gradingStatus) {
        setGradingStatus(scaleSetData.gradingStatus);
      }

      // Pre-fill existing grades and track if any exist
      const existingValues: Record<string, number> = {};
      gradesData.forEach((grade: any) => {
        existingValues[String(grade.scale_id)] = Number(grade.value);
      });
      setGradeValues(existingValues);
      setHasSubmittedGrades(gradesData.length > 0);
    } catch (error: any) {
      toast.error(error.message || t('loadFailed'));
      console.error('Load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGradeChange = (scaleId: string, value: string) => {
    const numValue = parseFloat(value);
    setGradeValues(prev => ({
      ...prev,
      [scaleId]: isNaN(numValue) ? 0 : numValue
    }));
  };

  // Calculate weighted average in real-time
  const calculateWeightedAverage = () => {
    if (!scaleSet?.scale_set_scales) return 0;

    let totalWeightedScore = 0;
    let totalWeight = 0;

    scaleSet.scale_set_scales.forEach((scaleItem: any) => {
      const scaleId = String(scaleItem.scale_id);
      const value = gradeValues[scaleId] || 0;
      const maxVal = Number(scaleItem.scales.maxVal);
      const weight = scaleItem.weight;

      // Normalize to 0-100 scale, then apply weight
      const normalizedScore = (value / maxVal) * 100;
      totalWeightedScore += normalizedScore * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? (totalWeightedScore / totalWeight).toFixed(2) : '0.00';
  };

  const handleSubmit = async () => {
    if (!scaleSet?.scale_set_scales) return;

    // Validate all scales are graded
    const missingGrades = scaleSet.scale_set_scales.filter(
      (scaleItem: any) => !gradeValues[String(scaleItem.scale_id)]
    );

    if (missingGrades.length > 0) {
      toast.error(t('missingGrades'));
      return;
    }

    setIsSaving(true);
    try {
      const grades = scaleSet.scale_set_scales.map((scaleItem: any) => ({
        scale_id: String(scaleItem.scale_id),
        value: gradeValues[String(scaleItem.scale_id)]
      }));

      await projectsApi.submitGrades(projectId, yearId, grades);
      toast.success(t('gradesSubmitted'));

      // Reload to show updated data
      await loadGradingData();
    } catch (error: any) {
      toast.error(error.message || t('gradesSubmitFailed'));
      console.error('Submit error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!scaleSet) {
    return (
      <div className="p-6 bg-background-secondary rounded-lg text-center">
        <p className="text-text-secondary">{t('noScaleSet')}</p>
      </div>
    );
  }

  const weightedAvg = calculateWeightedAverage();

  // Role label for display (Supervisor or Opponent)
  const roleLabel = projectRole === 'supervisor' ? tProjects('supervisor') : tProjects('opponent');

  // Determine if grading is allowed based on backend status
  const canGrade = gradingStatus?.canSubmit ?? true;
  const projectNotLocked = gradingStatus?.projectStatus && gradingStatus.projectStatus !== 'locked';
  const deadlinePassed = gradingStatus && !gradingStatus.isBeforeDeadline;

  return (
    <div className="space-y-6">
      {/* Role indicator and status banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-primary/10 border border-primary rounded-lg">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-text-primary">
            {t('gradingAs')}: <span className="text-primary">{roleLabel}</span>
          </span>
        </div>
        {hasSubmittedGrades && (
          <div className="flex items-center gap-2 text-status-success">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{t('gradesSubmittedStatus')}</span>
          </div>
        )}
      </div>

      {/* Warning: Project not locked yet */}
      {projectNotLocked && (
        <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning rounded-lg">
          <Lock className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-text-primary">{t('projectNotLocked')}</p>
            <p className="text-sm text-text-secondary mt-1">{t('projectNotLockedDesc')}</p>
          </div>
        </div>
      )}

      {/* Warning: Deadline passed */}
      {deadlinePassed && (
        <div className="flex items-start gap-3 p-4 bg-status-error/10 border border-status-error rounded-lg">
          <Clock className="w-5 h-5 text-status-error flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-text-primary">{t('deadlinePassed')}</p>
            <p className="text-sm text-text-secondary mt-1">{t('deadlinePassedDesc')}</p>
          </div>
        </div>
      )}

      {/* Feedback deadline info */}
      {gradingStatus?.feedbackDate && canGrade && (
        <div className="flex items-center gap-2 p-3 bg-background-secondary border border-border rounded-lg">
          <Clock className="w-4 h-4 text-text-secondary" />
          <span className="text-sm text-text-secondary">
            {t('feedbackDeadline')}: <span className="font-medium text-text-primary">{new Date(gradingStatus.feedbackDate).toLocaleDateString()}</span>
          </span>
        </div>
      )}

      {/* Instructions banner */}
      <div className="p-4 bg-background-secondary border border-border rounded-lg">
        <p className="text-sm text-text-secondary">
          {t('instructions')}
        </p>
      </div>

      {/* Grading scales */}
      <div className="space-y-4">
        {scaleSet.scale_set_scales.map((scaleItem: any) => {
          const scale = scaleItem.scales;
          const scaleId = String(scaleItem.scale_id);
          const currentValue = gradeValues[scaleId] || 0;
          const maxVal = Number(scale.maxVal);

          return (
            <div key={scaleId} className="p-4 bg-background-elevated border border-border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-text-primary">{scale.name}</h4>
                  {scale.desc && (
                    <p className="text-sm text-text-secondary mt-1">{scale.desc}</p>
                  )}
                </div>
                <span className="text-sm text-text-secondary ml-4 whitespace-nowrap">
                  {t('weight', { weight: scaleItem.weight })}
                </span>
              </div>

              <div className="flex items-center gap-4 mt-3">
                <input
                  type="number"
                  min="0"
                  max={maxVal}
                  step="0.5"
                  value={currentValue}
                  onChange={(e) => handleGradeChange(scaleId, e.target.value)}
                  disabled={!canGrade}
                  className="flex-1 px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-sm text-text-secondary whitespace-nowrap">
                  {t('points', { max: maxVal })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weighted average display */}
      <div className="p-4 bg-interactive-secondary rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          <span className="font-semibold text-text-primary">{t('weightedAverage')}</span>
        </div>
        <span className="text-2xl font-bold text-primary">{weightedAvg}%</span>
      </div>

      {/* Submit button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleSubmit}
          disabled={isSaving || !canGrade}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-text-inverse rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-text-inverse border-t-transparent rounded-full" />
              {t('saving')}
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {t('saveGrades')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
