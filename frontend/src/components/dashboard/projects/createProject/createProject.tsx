"use client";
import { formatUserName } from "@/lib/formatters";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import type { ProjectScheduleEntry } from "@sumbi/shared-types";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { UserSelect } from "@/components/ui/UserSelect";
import { SubjectSelect } from "@/components/ui/SubjectSelect";
import { Select } from "@/components/ui/Select";
import type { SelectOption } from "@/components/ui/Select";
import { ArrayInput } from "@/components/ui/ArrayInput";
import { ScheduleBuilder } from "./ScheduleBuilder";
import { projectsApi } from "@/lib/api/projects";
import { yearsApi, getAllYears } from "@/lib/api/years";

// Multi-step form for creating comprehensive project with all fields
export default function CreateProjectModule() {
  const router = useRouter();
  const { user, isLoading } = useAuth(); // Get current user for role-based logic
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [yearOptions, setYearOptions] = useState<SelectOption[]>([]); // dropdown options for academic years
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    title: "",
    subject_id: null as bigint | null,
    year_id: "" as string, // stored as string for Select component, converted to number on submit

    // Step 2: Topic & Goals
    topic: "",
    project_goal: "",

    // Step 3: Specification & Outputs
    specification: "",
    needed_output: [""] as string[],

    // Step 4: Schedule (optional)
    schedule: [] as ProjectScheduleEntry[],

    // Step 5: Team
    supervisor_id: null as string | null,
    opponent_id: null as string | null,
  });

  const totalSteps = 5;

  // Fetch all years for dropdown and pre-select the current year
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const [allYears, currentYear] = await Promise.all([
          getAllYears(),
          yearsApi.getCurrent(),
        ]);

        // Build dropdown options from all years
        // Fallback to "Unnamed" if year.name is null (shouldn't happen in practice)
        const options = allYears.map((y) => ({
          value: String(y.id),
          label: y.name ?? `Year #${y.id}`,
        }));
        setYearOptions(options);

        // Pre-select current year if no year was restored from draft
        if (currentYear?.id) {
          setFormData((prev) =>
            prev.year_id === "" ? { ...prev, year_id: String(currentYear.id) } : prev
          );
        } else {
          toast.warning("No active academic year found. Please contact admin.");
        }
      } catch (error) {
        console.error("Failed to fetch years:", error);
        toast.error("Failed to load academic years. Please try again.");
      }
    };

    fetchYears();
  }, []);

  // Load saved draft from sessionStorage on mount
  useEffect(() => {
    const savedDraft = sessionStorage.getItem("create-project-draft");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(parsed);
        toast.info("Restored unsaved draft from this session");
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    }
  }, []);

  // Auto-save draft to sessionStorage whenever formData changes (debounced 500ms)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        sessionStorage.setItem("create-project-draft", JSON.stringify(formData));
      } catch (e) {
        console.error("Failed to save draft:", e);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData]);

  // Auto-assign supervisor if user is a teacher (not admin)
  useEffect(() => {
    if (user && user.role === 'teacher' && !formData.supervisor_id) {
      setFormData(prev => ({ ...prev, supervisor_id: user.id }));
    }
  }, [user, formData.supervisor_id]);

  // Update form data without re-rendering slides
  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Determine if supervisor field is editable (only for admins)
  const isSupervisorEditable = user?.role === 'admin';

  // Validate step-specific fields and return errors object
  const validateStep = (step: number): Record<string, string> => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 0: // Basic Information
        if (formData.title.trim() === "") {
          errors.title = "Project title is required";
        }
        if (formData.subject_id === null) {
          errors.subject_id = "Subject selection is required";
        }
        if (!formData.year_id) {
          errors.year_id = "Academic year selection is required";
        }
        break;

      case 1: // Topic & Goals
        if (formData.topic.trim().length < 1) {
          errors.topic = "Project topic is required";
        }
        if (formData.project_goal.trim().length < 10) {
          errors.project_goal = "Project goal must be at least 10 characters";
        }
        break;

      case 2: // Specification & Outputs
        if (formData.specification.trim().length < 20) {
          errors.specification = "Project specification must be at least 20 characters";
        }
        const validOutputs = formData.needed_output.filter(item => item.trim().length >= 3);
        if (validOutputs.length < 1) {
          errors.needed_output = "At least one required output (minimum 3 characters) is required";
        }
        break;

      case 3: // Schedule (optional - no validation needed)
        break;

      case 4: // Team Selection
        if (formData.supervisor_id === null) {
          errors.supervisor_id = "Supervisor selection is required";
        }
        if (formData.opponent_id && formData.supervisor_id === formData.opponent_id) {
          errors.opponent_id = "Opponent must be different from supervisor";
        }
        break;
    }

    return errors;
  };

  // Validate all required fields before submission
  const validateForm = () => {
    const allErrors: Record<string, string> = {};

    // Validate all steps
    for (let i = 0; i < totalSteps; i++) {
      Object.assign(allErrors, validateStep(i));
    }

    return allErrors;
  };

  const nextStep = (e?: React.MouseEvent) => {
    // Prevent any accidental form submission
    e?.preventDefault();
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = (e?: React.MouseEvent) => {
    // Prevent any accidental form submission
    e?.preventDefault();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Scroll to top whenever step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentStep]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Safety check: Prevent submission if not on the final step
    // This prevents accidental submissions from Enter key presses
    if (currentStep !== totalSteps - 1) {
      console.warn('Attempted to submit form while not on final step');
      return;
    }

    // Additional safety: Only allow submission if user is actually clicking submit button
    // Check if the event was triggered by the submit button, not by Enter key
    const submitter = (e.nativeEvent as SubmitEvent).submitter;
    if (submitter && submitter.getAttribute('type') !== 'submit') {
      console.warn('Form submission attempted from non-submit button');
      return;
    }

    // Validate all required fields
    const errors = validateForm();
    const errorCount = Object.keys(errors).length;
    
    if (errorCount > 0) {
      // Set all field errors to highlight them
      setFieldErrors(errors);
      
      // Find first step with errors and navigate to it
      for (let i = 0; i < totalSteps; i++) {
        const stepErrors = validateStep(i);
        
        if (Object.keys(stepErrors).length > 0) {
          setCurrentStep(i);
          
          // Wait for step transition, then scroll to first error field
          setTimeout(() => {
            const firstErrorField = Object.keys(stepErrors)[0];
            const errorElement = document.getElementById(firstErrorField);
            
            if (errorElement) {
              errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              errorElement.focus();
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }, 600); // Wait for slide transition (500ms + buffer)
          
          toast.error(`Please fill in all required fields (${errorCount} error${errorCount > 1 ? 's' : ''} found)`);
          break;
        }
      }
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({}); // Clear errors on valid submission

    try {
      // Verify year is selected (should be caught by validation, but double-check)
      if (!formData.year_id) {
        toast.error("No academic year selected. Please select a year.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        title: formData.title,
        subject_id: formData.subject_id,
        supervisor_id: formData.supervisor_id,
        opponent_id: formData.opponent_id,
        year_id: Number(formData.year_id), // convert string back to number for the API
        status: 'draft' as const,

        // Nested project description
        project_description: {
          topic: formData.topic,
          project_goal: formData.project_goal,
          specification: formData.specification,
          needed_output: formData.needed_output.filter(item => item.trim() !== ""),
          schedule: formData.schedule.length > 0 ? formData.schedule : undefined,
        },
      };

      const createdProject = await projectsApi.createProject(payload);

      toast.success("Project created successfully!");
      sessionStorage.removeItem("create-project-draft");
      router.push(`/projects/${createdProject.id}`);
    } catch (error: any) {
      console.error("Failed to create project:", error);
      
      // Handle validation errors from backend
      if (error.statusCode === 400 && error.details) {
        const backendErrors: Record<string, string> = {};
        
        // Map backend validation errors to field names
        error.details.forEach((detail: { path: string; message: string }) => {
          // Extract field name from path like "body.project_description.project_goal"
          const pathParts = detail.path.split('.');
          const fieldName = pathParts[pathParts.length - 1];
          
          // Map to our form field names
          const fieldMap: Record<string, string> = {
            'title': 'title',
            'subject_id': 'subject_id',
            'year_id': 'year_id',
            'topic': 'topic',
            'project_goal': 'project_goal',
            'specification': 'specification',
            'needed_output': 'needed_output',
            'supervisor_id': 'supervisor_id',
            'opponent_id': 'opponent_id',
          };
          
          const mappedField = fieldMap[fieldName];
          if (mappedField) {
            backendErrors[mappedField] = detail.message;
          }
        });
        
        // Set field errors
        setFieldErrors(backendErrors);
        
        // Navigate to first error
        const errorFields = Object.keys(backendErrors);
        if (errorFields.length > 0) {
          for (let i = 0; i < totalSteps; i++) {
            const stepErrors = validateStep(i);
            const hasBackendError = errorFields.some(field => 
              Object.keys(stepErrors).includes(field)
            );
            
            if (hasBackendError || Object.keys(stepErrors).length > 0) {
              setCurrentStep(i);
              setTimeout(() => {
                const firstErrorField = errorFields[0];
                const errorElement = document.getElementById(firstErrorField);
                if (errorElement) {
                  errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  errorElement.focus();
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }, 600);
              break;
            }
          }
        }
        
        // Show formatted error message
        const errorMessages = error.details.map((d: any) => d.message).join(', ');
        toast.error(`Validation failed: ${errorMessages}`);
      } else {
        // Generic error
        toast.error(error.message || "Failed to create project. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate progress percentage based on current step
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  // Clear draft and reset form to initial state
  const handleClearDraft = () => {
    if (confirm("Clear saved draft and reset form?")) {
      sessionStorage.removeItem("create-project-draft");
      setFormData({
        title: "",
        subject_id: null,
        year_id: "",
        topic: "",
        project_goal: "",
        specification: "",
        needed_output: [""],
        schedule: [],
        supervisor_id: null,
        opponent_id: null,
      });
      setCurrentStep(0);
      toast.success("Draft cleared");
    }
  };

  // Show loading while fetching user data
  if (isLoading) {
    return (
      <div className="bg-background-elevated w-full max-w-4xl mx-auto p-6 rounded-lg shadow-md">
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  // Middleware already blocks students, but double-check as defense in depth
  if (!user) {
    return null; // Let middleware handle the redirect
  }

  return (
    <div className="bg-background-elevated w-full max-w-full sm:max-w-4xl mx-auto p-3 sm:p-6 md:p-8 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-text-primary">
          Create New Project
        </h1>
        <button
          type="button"
          onClick={handleClearDraft}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Clear Draft
        </button>
      </div>

      {/* Custom progress bar */}
      <div className="mb-6">
        <div className="relative h-3 bg-background-secondary rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out flex items-center justify-end pr-2"
            style={{ width: `${progressPercentage}%` }}
          >
            <span className="text-xs font-semibold text-text-inverse min-w-[2rem] text-center">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>
        <p className="text-sm text-text-secondary mt-2 text-center">
          Step {currentStep + 1} of {totalSteps}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        onKeyDown={(e) => {
          // Prevent Enter from submitting form on ALL steps (user must click the submit button)
          // Allow Enter in textarea elements for multi-line input
          if (e.key === 'Enter' && e.target instanceof HTMLElement) {
            const isTextarea = e.target.tagName === 'TEXTAREA';
            const isInRichTextEditor = e.target.closest('[contenteditable="true"]');

            // Allow Enter in textareas and rich text editors, prevent everywhere else
            if (!isTextarea && !isInRichTextEditor) {
              e.preventDefault();
              e.stopPropagation();
              console.log('[CreateProject] Blocked Enter key to prevent form submission');
              return false;
            }
          }
        }}
      >
        {/* Sliding container - uses transform to slide between steps */}
        <div className="overflow-visible relative">
          {/* Step 1: Basic Information */}
          <div 
            className={`w-full space-y-6 px-1 transition-all duration-500 ${currentStep === 0 ? 'opacity-100 relative' : 'opacity-0 absolute top-0 left-0 pointer-events-none'}`}
          >
            <h2 className="text-base sm:text-lg font-medium text-text-primary mb-4">
              Basic Information
            </h2>
            <Input
              label="Project Title"
              id="title"
              name="title"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              helperText="Enter a descriptive title for your project"
              maxLength={100}
              showCharCount
              required
              error={fieldErrors.title}
            />
            <SubjectSelect
              label="Subject"
              id="subject"
              value={formData.subject_id}
              onChange={(subjectId) => updateField("subject_id", subjectId)}
              helperText="Select the course or subject area for this project"
              required
              error={fieldErrors.subject_id}
            />
            {/* Academic year selector — pre-filled with current year */}
            <Select
              label="Academic Year"
              id="year_id"
              options={yearOptions}
              value={formData.year_id}
              onChange={(value) => updateField("year_id", value)}
              helperText="Select the academic year this project belongs to"
              required
              error={fieldErrors.year_id}
            />
          </div>

          {/* Step 2: Topic & Goals */}
          <div 
            className={`w-full space-y-6 px-1 transition-all duration-500 ${currentStep === 1 ? 'opacity-100 relative' : 'opacity-0 absolute top-0 left-0 pointer-events-none'}`}
          >
              <h2 className="text-base sm:text-lg font-medium text-text-primary mb-4">
                Topic & Goals
              </h2>
              <Input
                label="Project Topic"
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={(e) => updateField("topic", e.target.value)}
                helperText="Brief topic or marketing name for your project"
                maxLength={150}
                showCharCount
                required
                error={fieldErrors.topic}
              />
              <Textarea
                label="Project Goal"
                id="project_goal"
                name="project_goal"
                rows={6}
                value={formData.project_goal}
                onChange={(e) => updateField("project_goal", e.target.value)}
                helperText="Describe the main objective and what you aim to achieve (minimum 10 characters)"
                maxLength={1000}
                showCharCount
                required
                error={fieldErrors.project_goal}
              />
            </div>

            {/* Step 3: Specification & Outputs */}
            <div 
              className={`w-full space-y-6 px-1 transition-all duration-500 ${currentStep === 2 ? 'opacity-100 relative' : 'opacity-0 absolute top-0 left-0 pointer-events-none'}`}
            >
              <h2 className="text-base sm:text-lg font-medium text-text-primary mb-4">
                Specification & Required Outputs
              </h2>
              <MarkdownEditor
                label="Project Specification"
                id="specification"
                value={formData.specification}
                onChange={(value) => updateField("specification", value)}
                helperText="Define the detailed scope of work, requirements, and implementation plan (minimum 20 characters)"
                maxLength={5000}
                showCharCount
                required
                minHeight={250}
                error={fieldErrors.specification}
              />
              <ArrayInput
                label="Required Outputs"
                value={formData.needed_output}
                onChange={(items) => updateField("needed_output", items)}
                helperText="List all deliverables you must produce (minimum 3 characters each, e.g., 'Working application', 'User documentation')"
                placeholder="Enter output item"
                required
                minItems={1}
                minLength={3}
                error={fieldErrors.needed_output}
              />
            </div>

            {/* Step 4: Schedule */}
            <div 
              className={`w-full space-y-6 px-1 transition-all duration-500 ${currentStep === 3 ? 'opacity-100 relative' : 'opacity-0 absolute top-0 left-0 pointer-events-none'}`}
            >
              <h2 className="text-base sm:text-lg font-medium text-text-primary mb-4">
                Timeline (Optional)
              </h2>
              <p className="text-sm text-text-secondary mb-4">
                Create a month-by-month schedule for your project milestones. You can skip this step and add it later if needed.
              </p>
              <ScheduleBuilder
                value={formData.schedule}
                onChange={(schedule) => updateField("schedule", schedule)}
              />
            </div>

            {/* Step 5: Team Selection */}
            <div 
              className={`w-full space-y-6 px-1 transition-all duration-500 ${currentStep === 4 ? 'opacity-100 relative' : 'opacity-0 absolute top-0 left-0 pointer-events-none'}`}
            >
              <h2 className="text-base sm:text-lg font-medium text-text-primary mb-4">
                Team Selection
              </h2>

              {/* Supervisor field - editable for admin, fixed for teacher */}
              {isSupervisorEditable ? (
                <UserSelect
                  label="Supervisor"
                  id="supervisor"
                  value={formData.supervisor_id}
                  onChange={(userId) => updateField("supervisor_id", userId)}
                  helperText="Select the teacher who will supervise this project"
                  excludeUserId={formData.opponent_id || undefined}
                  required
                  error={fieldErrors.supervisor_id}
                />
              ) : (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary">
                    Supervisor <span className="text-danger">*</span>
                  </label>
                  <div className="border rounded-lg bg-background-secondary p-3 text-text-primary">
                    {formatUserName(user?.first_name, user?.last_name) || user?.email || 'You'}
                  </div>
                  <p className="text-xs text-text-secondary">You are automatically assigned as the supervisor</p>
                  {fieldErrors.supervisor_id && (
                    <p className="text-sm text-danger">{fieldErrors.supervisor_id}</p>
                  )}
                </div>
              )}

              <UserSelect
                label="Opponent"
                id="opponent"
                value={formData.opponent_id}
                onChange={(userId) => updateField("opponent_id", userId)}
                helperText="Select the teacher who will review this project (optional)"
                excludeUserId={formData.supervisor_id || undefined}
                required={false}
                error={fieldErrors.opponent_id}
              />
              {formData.supervisor_id &&
                formData.opponent_id &&
                formData.supervisor_id === formData.opponent_id && (
                  <p className="text-sm text-danger">
                    ⚠️ Supervisor and opponent must be different people
                  </p>
                )}
            </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 sm:gap-0 mt-8">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="w-full sm:w-auto px-6 py-2 border border-border rounded-lg text-text-primary hover:bg-background-secondary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentStep < totalSteps - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="w-full sm:w-auto px-6 py-2 bg-primary text-text-inverse rounded-lg hover:bg-primary-dark transition-colors duration-200"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2 bg-primary text-text-inverse rounded-lg hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-text-inverse border-t-transparent rounded-full" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
