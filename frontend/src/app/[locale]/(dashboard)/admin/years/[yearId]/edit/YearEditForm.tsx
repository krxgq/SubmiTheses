'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/lib/navigation';
import { Button } from 'flowbite-react';
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
    setLoading(true);

    try {
      await updateYear(year.id, formData);
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update year');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-background-elevated p-6 rounded-xl border border-border">
      <h2 className="text-lg font-semibold text-text-primary">Edit Year Details</h2>

      <AcademicYearSelector
        label="Academic Year"
        value={startYear}
        onChange={setStartYear}
        helperText="Modify the academic year range"
        required
      />

      <Input
        label="Assignment Date"
        id="assignment_date"
        type="date"
        value={formData.assignment_date}
        onChange={(e) => setFormData({ ...formData, assignment_date: e.target.value })}
        helperText="When projects are assigned to students"
      />

      <Input
        label="Submission Date"
        id="submission_date"
        type="date"
        value={formData.submission_date}
        onChange={(e) => setFormData({ ...formData, submission_date: e.target.value })}
        helperText="When students must submit their theses"
      />

      <Input
        label="Feedback Date"
        id="feedback_date"
        type="date"
        value={formData.feedback_date}
        onChange={(e) => setFormData({ ...formData, feedback_date: e.target.value })}
        helperText="Final deadline for reviews and grading"
      />

      {error && (
        <div className="text-danger bg-danger/10 border border-danger/30 rounded-lg p-3 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5" />
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button className="bg-primary hover:bg-primary-hover text-text-inverse px-6 py-2.5 rounded-lg font-medium transition-all" onClick={() => router.push('/admin')} type="button">
          Cancel
        </Button>
      </div>
    </form>
  );
}
