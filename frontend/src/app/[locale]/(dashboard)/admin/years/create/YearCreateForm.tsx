'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/lib/navigation';
import { Button } from 'flowbite-react';
import { Input } from '@/components/ui/Input';
import { AcademicYearSelector } from '@/components/ui/AcademicYearSelector';
import { ChevronRight, ChevronLeft, AlertCircle, Trash2 } from 'lucide-react';
import {
  createYear,
  generateNextYearName,
  type Year
} from '@/lib/api/years';
import { bulkCloneScaleSets } from '@/lib/api/scale-sets';

interface YearCreateFormProps {
  cloneSourceYear?: Year | null;
  cloneSourceScaleSets?: any[] | null;
}

// Frontend form data type - dates are always strings in forms
interface YearFormData {
  name?: string;
  assignment_date: string;
  submission_date: string;
  feedback_date: string;
}

type Step = 'year-details' | 'scale-sets-review';

// Client component for creating years with two-step workflow for cloning scale sets
export function YearCreateForm({ cloneSourceYear, cloneSourceScaleSets }: YearCreateFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('year-details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdYear, setCreatedYear] = useState<Year | null>(null);

  // Step 1: Year details form
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear());
  const [yearData, setYearData] = useState<YearFormData>({
    name: '',
    assignment_date: '',
    submission_date: '',
    feedback_date: '',
  });

  // Auto-generate year name from start year (e.g., 2025 -> "2025/2026")
  useEffect(() => {
    setYearData((prev) => ({
      ...prev,
      name: `${startYear}/${startYear + 1}`,
    }));
  }, [startYear]);

  // Step 2: Scale sets to clone (editable)
  const [scaleSetsToClone, setScaleSetsToClone] = useState<Array<{
    name: string;
    project_role: 'supervisor' | 'opponent';
    scales: Array<{
      scale_id: bigint;
      scale_name: string;
      weight: number;
      display_order?: number;
    }>;
  }>>([]);

  // Auto-populate form when cloning
  useEffect(() => {
    if (cloneSourceYear) {
      const assignmentDate = cloneSourceYear.assignment_date
        ? new Date(cloneSourceYear.assignment_date).toISOString().split('T')[0]
        : '';
      const submissionDate = cloneSourceYear.submission_date
        ? new Date(cloneSourceYear.submission_date).toISOString().split('T')[0]
        : '';
      const feedbackDate = cloneSourceYear.feedback_date
        ? new Date(cloneSourceYear.feedback_date).toISOString().split('T')[0]
        : '';

      // Auto-generate next year (extract start year from source and increment)
      if (cloneSourceYear.name) {
        const match = cloneSourceYear.name.match(/^(\d{4})/);
        if (match) {
          setStartYear(parseInt(match[1]) + 1);
        }
      }

      setYearData({
        name: '',
        assignment_date: assignmentDate,
        submission_date: submissionDate,
        feedback_date: feedbackDate,
      });
    }
  }, [cloneSourceYear]);

  // Populate scale sets for cloning
  useEffect(() => {
    if (cloneSourceScaleSets) {
      const formatted = cloneSourceScaleSets.map((scaleSet) => ({
        name: scaleSet.name,
        project_role: scaleSet.project_role,
        scales: (scaleSet.scale_set_scales || []).map((sss: any) => ({
          scale_id: sss.scale_id,
          scale_name: sss.scales.name,
          weight: sss.weight,
          display_order: sss.display_order,
        })),
      }));
      setScaleSetsToClone(formatted);
    }
  }, [cloneSourceScaleSets]);

  // Step 1: Create year
  const handleCreateYear = async () => {
    setError('');

    // Validate date ordering before sending to backend
    if (yearData.assignment_date && yearData.submission_date &&
        new Date(yearData.assignment_date) >= new Date(yearData.submission_date)) {
      setError('Assignment date must be before submission date');
      return;
    }
    if (yearData.submission_date && yearData.feedback_date &&
        new Date(yearData.submission_date) >= new Date(yearData.feedback_date)) {
      setError('Submission date must be before feedback date');
      return;
    }

    setLoading(true);

    try {
      const created = await createYear(yearData);
      setCreatedYear(created);

      // If cloning scale sets, move to step 2
      if (scaleSetsToClone.length > 0) {
        setCurrentStep('scale-sets-review');
      } else {
        // No scale sets to clone, redirect immediately
        router.push('/admin');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create year');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Clone scale sets
  const handleCloneScaleSets = async () => {
    if (!createdYear) return;

    setError('');
    setLoading(true);

    try {
      await bulkCloneScaleSets({
        yearId: createdYear.id,
        scaleSetsData: scaleSetsToClone.map((ss) => ({
          name: ss.name,
          project_role: ss.project_role,
          scales: ss.scales.map((s) => ({
            scale_id: s.scale_id,
            weight: s.weight,
            display_order: s.display_order,
          })),
        })),
      });

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to clone scale sets');
    } finally {
      setLoading(false);
    }
  };

  // Skip cloning scale sets
  const handleSkipCloning = () => {
    router.push('/admin');
    router.refresh();
  };

  // Remove a scale set from cloning list
  const removeScaleSet = (index: number) => {
    setScaleSetsToClone((prev) => prev.filter((_, i) => i !== index));
  };

  // Update scale set name
  const updateScaleSetName = (index: number, newName: string) => {
    setScaleSetsToClone((prev) =>
      prev.map((ss, i) => (i === index ? { ...ss, name: newName } : ss))
    );
  };

  // Update scale weight
  const updateScaleWeight = (scaleSetIndex: number, scaleIndex: number, newWeight: number) => {
    setScaleSetsToClone((prev) =>
      prev.map((ss, i) => {
        if (i !== scaleSetIndex) return ss;
        return {
          ...ss,
          scales: ss.scales.map((s, j) => (j === scaleIndex ? { ...s, weight: newWeight } : s)),
        };
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      {scaleSetsToClone.length > 0 && (
        <div className="flex items-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${currentStep === 'year-details' ? 'text-primary' : 'text-success'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'year-details' ? 'bg-primary text-text-inverse' : 'bg-success text-text-inverse'}`}>
              1
            </div>
            <span className="font-medium">Year Details</span>
          </div>

          <ChevronRight className="w-5 h-5 text-text-secondary" />

          <div className={`flex items-center gap-2 ${currentStep === 'scale-sets-review' ? 'text-primary' : 'text-text-secondary'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'scale-sets-review' ? 'bg-primary text-text-inverse' : 'bg-background-secondary border-2 border-border'}`}>
              2
            </div>
            <span className="font-medium">Review Scale Sets</span>
          </div>
        </div>
      )}

      {/* Step 1: Year Details */}
      {currentStep === 'year-details' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateYear();
          }}
          className="bg-background-elevated p-6 rounded-xl border border-border space-y-6"
        >
          <h2 className="text-lg font-semibold text-text-primary">Academic Year Information</h2>

          {cloneSourceYear && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
              <p className="text-sm text-primary">
                <strong>Cloning from:</strong> {cloneSourceYear.name}
                <br />
                Dates are pre-filled from the source year. You can adjust them as needed.
              </p>
            </div>
          )}

          <AcademicYearSelector
            label="Academic Year"
            value={startYear}
            onChange={setStartYear}
            helperText="Select the starting year for this academic period"
            required
          />

          <Input
            label="Assignment Date"
            id="assignment_date"
            type="date"
            value={yearData.assignment_date}
            onChange={(e) => setYearData({ ...yearData, assignment_date: e.target.value })}
            required
            max={yearData.submission_date || undefined}
            helperText="When projects are assigned to students"
          />

          <Input
            label="Submission Date"
            id="submission_date"
            type="date"
            value={yearData.submission_date}
            onChange={(e) => setYearData({ ...yearData, submission_date: e.target.value })}
            required
            min={yearData.assignment_date || undefined}
            max={yearData.feedback_date || undefined}
            helperText="When students must submit their theses"
          />

          <Input
            label="Feedback Date"
            id="feedback_date"
            type="date"
            value={yearData.feedback_date}
            onChange={(e) => setYearData({ ...yearData, feedback_date: e.target.value })}
            required
            min={yearData.submission_date || undefined}
            helperText="Final deadline for reviews and grading"
          />

          {error && (
            <div className="text-danger bg-danger/10 border border-danger/30 rounded-lg p-3 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary-hover text-text-inverse px-6 py-2.5 rounded-lg font-medium transition-all">
              {loading ? 'Creating...' : scaleSetsToClone.length > 0 ? 'Next: Review Scale Sets' : 'Create Year'}
            </Button>
            <Button className="bg-primary hover:bg-primary-hover text-text-inverse px-6 py-2.5 rounded-lg font-medium transition-all" onClick={() => router.push('/admin')} type="button">
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Step 2: Scale Sets Review */}
      {currentStep === 'scale-sets-review' && createdYear && (
        <div className="space-y-6">
          <div className="bg-background-elevated p-6 rounded-xl border border-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Review Scale Sets to Clone</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Year "{createdYear.name}" has been created. Review and modify the scale sets below before cloning them.
                </p>
              </div>
            </div>

            {scaleSetsToClone.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-secondary">All scale sets have been removed. Click "Finish" to complete.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {scaleSetsToClone.map((scaleSet, scaleSetIndex) => {
                  const totalWeight = scaleSet.scales.reduce((sum, s) => sum + s.weight, 0);

                  return (
                    <div key={scaleSetIndex} className="border border-border rounded-lg p-4 bg-background-secondary">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <Input
                            label="Scale Set Name"
                            id={`scaleset-name-${scaleSetIndex}`}
                            type="text"
                            value={scaleSet.name}
                            onChange={(e) => updateScaleSetName(scaleSetIndex, e.target.value)}
                            className="mb-2"
                          />
                          <div className="flex items-center gap-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              scaleSet.project_role === 'supervisor'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-accent/10 text-accent'
                            }`}>
                              {scaleSet.project_role === 'supervisor' ? 'Supervisor' : 'Opponent'}
                            </span>
                            <span className={`font-medium ${totalWeight === 100 ? 'text-success' : 'text-warning'}`}>
                              Total Weight: {totalWeight}% {totalWeight !== 100 && '(should be 100%)'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeScaleSet(scaleSetIndex)}
                          className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                          title="Remove this scale set"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2 mt-4">
                        <h4 className="text-sm font-semibold text-text-primary">Scales ({scaleSet.scales.length})</h4>
                        {scaleSet.scales.map((scale, scaleIndex) => (
                          <div key={scaleIndex} className="flex items-center justify-between bg-background-elevated p-2 rounded">
                            <span className="text-sm text-text-primary">{scale.scale_name}</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={scale.weight}
                                onChange={(e) =>
                                  updateScaleWeight(scaleSetIndex, scaleIndex, Number(e.target.value))
                                }
                                className="w-20 px-2 py-1 border border-border rounded text-sm"
                              />
                              <span className="text-xs text-text-secondary">%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <div className="text-danger bg-danger/10 border border-danger/30 rounded-lg p-3 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleCloneScaleSets} disabled={loading || scaleSetsToClone.length === 0} className="bg-primary hover:bg-primary-hover text-text-inverse px-6 py-2.5 rounded-lg font-medium transition-all">
              {loading ? 'Cloning...' : 'Clone Scale Sets & Finish'}
            </Button>
            <Button className="bg-primary hover:bg-primary-hover text-text-inverse px-6 py-2.5 rounded-lg font-medium transition-all" onClick={handleSkipCloning} disabled={loading}>
              Skip Cloning & Finish
            </Button>
            <Button
              className="bg-primary hover:bg-primary-hover text-text-inverse px-6 py-2.5 rounded-lg font-medium transition-all ml-auto"
              onClick={() => setCurrentStep('year-details')}
              disabled={loading}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Year Details
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
