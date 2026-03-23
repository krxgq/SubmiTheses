'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/lib/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AcademicYearSelector } from '@/components/ui/AcademicYearSelector';
import { updateYear, type Year } from '@/lib/api/years';
import { AlertCircle } from 'lucide-react';

interface YearEditFormProps {
  year: Year;
}

// Frontend form data type - dates are always strings in forms
interface YearFormData {
  name?: string;
  assignment_date?: string;
  submission_date?: string;
  feedback_date?: string;
}

// Client component for editing year details
export function YearEditForm({ year }: YearEditFormProps) {
  const router = useRouter();
  const t = useTranslations('admin.years');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Extract start year from year name (e.g., "2025/2026" -> 2025)
  const extractStartYear = (name: string | null): number => {
    if (!name) return new Date().getFullYear();
    const match = name.match(/^(\d{4})/);
    return match ? parseInt(match[1]) : new Date().getFullYear();
  };

  const [startYear, setStartYear] = useState<number>(extractStartYear(year.name));
  const [formData, setFormData] = useState<YearFormData>({
    name: year.name || '',
    assignment_date: year.assignment_date
      ? new Date(year.assignment_date).toISOString().split('T')[0]
      : '',
    submission_date: year.submission_date
      ? new Date(year.submission_date).toISOString().split('T')[0]
      : '',
    feedback_date: year.feedback_date
      ? new Date(year.feedback_date).toISOString().split('T')[0]
      : '',
  });

  // Auto-generate year name from start year
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: `${startYear}/${startYear + 1}`,
    }));
  }, [startYear]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate date ordering before sending to backend
    if (formData.assignment_date && formData.submission_date &&
        new Date(formData.assignment_date) >= new Date(formData.submission_date)) {
      setError(t('errors.assignmentBeforeSubmission'));
      return;
    }
    if (formData.submission_date && formData.feedback_date &&
        new Date(formData.submission_date) >= new Date(formData.feedback_date)) {
      setError(t('errors.submissionBeforeFeedback'));
      return;
    }

    setLoading(true);

    try {
      await updateYear(year.id, formData);
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || t('errors.updateFailed'));
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-background-elevated p-6 rounded-xl border border-border">
      <h2 className="text-lg font-semibold text-text-primary">{t('edit')}</h2>

      <AcademicYearSelector
        label={t('name')}
        value={startYear}
        onChange={setStartYear}
        helperText={t('academicYearHelper')}
        required
      />

      {/* min/max constraints give immediate feedback in the date picker */}
      <Input
        label={t('assignmentDate')}
        id="assignment_date"
        type="date"
        value={formData.assignment_date}
        onChange={(e) => setFormData({ ...formData, assignment_date: e.target.value })}
        max={formData.submission_date || undefined}
        helperText={t('assignmentDateHelper')}
      />

      <Input
        label={t('submissionDate')}
        id="submission_date"
        type="date"
        value={formData.submission_date}
        onChange={(e) => setFormData({ ...formData, submission_date: e.target.value })}
        min={formData.assignment_date || undefined}
        max={formData.feedback_date || undefined}
        helperText={t('submissionDateHelper')}
      />

      <Input
        label={t('feedbackDate')}
        id="feedback_date"
        type="date"
        value={formData.feedback_date}
        onChange={(e) => setFormData({ ...formData, feedback_date: e.target.value })}
        min={formData.submission_date || undefined}
        helperText={t('feedbackDateHelper')}
      />

      {error && (
        <div className="text-danger bg-danger/10 border border-danger/30 rounded-lg p-3 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5" />
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" loading={loading}>
          {t('saveChanges')}
        </Button>
        <Button variant="secondary" onClick={() => router.push('/admin')} type="button">
          {t('cancel')}
        </Button>
      </div>
    </form>
  );
}
