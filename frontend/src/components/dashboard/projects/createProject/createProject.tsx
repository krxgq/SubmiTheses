"use client";
import { formatUserName } from "@/lib/formatters";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import type { ProjectScheduleEntry } from "@sumbi/shared-types";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { UserSelect } from "@/components/ui/UserSelect";
import { SubjectSelect } from "@/components/ui/SubjectSelect";
import { ArrayInput } from "@/components/ui/ArrayInput";
import { ScheduleBuilder } from "./ScheduleBuilder";
import { projectsApi } from "@/lib/api/projects";
import { yearsApi } from "@/lib/api/years";

// Multi-step form for creating comprehensive project with all fields
export default function CreateProjectModule() {
  const router = useRouter();
  const { user, isLoading } = useAuth(); // Get current user for role-based logic
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentYearId, setCurrentYearId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    title: "",
    subject_id: null as bigint | null, 

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

  // Fetch current academic year on mount
  useEffect(() => {
    const fetchCurrentYear = async () => {
      try {
        const year = await yearsApi.getCurrent();
        if (year?.id) {
          setCurrentYearId(Number(year.id));
        } else {
          toast.warning("No active academic year found. Please contact admin.");
        }
      } catch (error) {
        console.error("Failed to fetch current year:", error);
        toast.error("Failed to load academic year. Please try again.");
      }
    };

    fetchCurrentYear();
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
      user && setFormData(prev => ({ ...prev, supervisor_id: user.id }));
  }, [user]);

  // Update form data without re-rendering slides
  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Determine if supervisor field is editable (only for admins)
  const isSupervisorEditable = user?.role === 'admin';

  // Validate all required fields before submission
  const validateForm = () => {
    const errors: string[] = [];

    // Step 1: Basic Information
    if (formData.title.trim() === "") {
      errors.push("Project title is required");
    }
    if (formData.subject_id === null) {
      errors.push("Subject selection is required");
    }

    // Step 2: Topic & Goals
    if (formData.topic.trim().length < 1) {
      errors.push("Project topic is required");
    }
    if (formData.project_goal.trim().length < 10) {
      errors.push("Project goal must be at least 10 characters");
    }

    // Step 3: Specification & Outputs
    if (formData.specification.trim().length < 20) {
      errors.push("Project specification must be at least 20 characters");
    }
    if (formData.needed_output.length < 1 || !formData.needed_output.some(item => item.trim().length >= 3)) {
      errors.push("At least one required output (minimum 3 characters) is required");
    }

    // Step 5: Team Selection
    if (formData.supervisor_id === null) {
      errors.push("Supervisor selection is required");
    }
    if (formData.opponent_id && formData.supervisor_id === formData.opponent_id) {
      errors.push("Opponent must be different from supervisor");
    }

    return errors;
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setIsSubmitting(true);

    try {
      // Verify we have a current year
      if (!currentYearId) {
        toast.error("No active academic year found. Please contact admin.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        title: formData.title,
        subject_id: formData.subject_id, // Changed from subject string to subject_id
        supervisor_id: formData.supervisor_id,
        opponent_id: formData.opponent_id,
        year_id: currentYearId, // Use fetched current year
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
      // Clear saved draft after successful submission
     sessionStorage.removeItem("create-project-draft");
      router.push(`/projects/${createdProject.id}`);
    } catch (error: any) {
      console.error("Failed to create project:", error);
      toast.error(error.message || "Failed to create project. Please try again.");
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
        subject_id: null, // Fixed: Changed from subject to subject_id
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
    <div className="bg-background-elevated w-full max-w-4xl mx-auto p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">
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
            <span className="text-xs font-semibold text-white">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>
        <p className="text-sm text-text-secondary mt-2 text-center">
          Step {currentStep + 1} of {totalSteps}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Sliding container - uses transform to slide between steps */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentStep * 100}%)` }}
          >
            {/* Step 1: Basic Information */}
            <div className="w-full flex-shrink-0 space-y-6 px-1">
              <h2 className="text-lg font-medium text-text-primary mb-4">
                Basic Information
              </h2>
              <Input
                label="Project Title"
                id="title"
                name="title"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                helperText="Enter a descriptive title for your project"
                required
              />
              <SubjectSelect
                label="Subject"
                id="subject"
                value={formData.subject_id}
                onChange={(subjectId) => updateField("subject_id", subjectId)}
                helperText="Select the course or subject area for this project"
                required
              />
            </div>

            {/* Step 2: Topic & Goals */}
            <div className="w-full flex-shrink-0 space-y-6 px-1">
              <h2 className="text-lg font-medium text-text-primary mb-4">
                Topic & Goals
              </h2>
              <Input
                label="Project Topic"
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={(e) => updateField("topic", e.target.value)}
                helperText="Brief topic or marketing name for your project"
                required
              />
              <Textarea
                label="Project Goal"
                id="project_goal"
                name="project_goal"
                rows={6}
                value={formData.project_goal}
                onChange={(e) => updateField("project_goal", e.target.value)}
                helperText="Describe the main objective and what you aim to achieve (minimum 10 characters)"
                required
              />
            </div>

            {/* Step 3: Specification & Outputs */}
            <div className="w-full flex-shrink-0 space-y-6 px-1">
              <h2 className="text-lg font-medium text-text-primary mb-4">
                Specification & Required Outputs
              </h2>
              <RichTextEditor
                label="Project Specification"
                id="specification"
                value={formData.specification}
                onChange={(value) => updateField("specification", value)}
                helperText="Define the detailed scope of work, requirements, and implementation plan (minimum 20 characters)"
                required
                minHeight={250}
              />
              <ArrayInput
                label="Required Outputs"
                value={formData.needed_output}
                onChange={(items) => updateField("needed_output", items)}
                helperText="List all deliverables you must produce (e.g., 'Working application', 'User documentation')"
                placeholder="Enter output item"
                required
                minItems={1}
              />
            </div>

            {/* Step 4: Schedule */}
            <div className="w-full flex-shrink-0 space-y-6 px-1">
              <h2 className="text-lg font-medium text-text-primary mb-4">
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
            <div className="w-full flex-shrink-0 space-y-6 px-1">
              <h2 className="text-lg font-medium text-text-primary mb-4">
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
                />
              ) : (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary">
                    Supervisor <span className="text-red-500">*</span>
                  </label>
                  <div className="border rounded-lg bg-background-secondary p-3 text-text-primary">
                    {formatUserName(user?.first_name, user?.last_name) || user?.email || 'You'}
                  </div>
                  <p className="text-xs text-text-secondary">You are automatically assigned as the supervisor</p>
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
              />
              {formData.supervisor_id &&
                formData.opponent_id &&
                formData.supervisor_id === formData.opponent_id && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    ⚠️ Supervisor and opponent must be different people
                  </p>
                )}
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-6 py-2 border border-border rounded-lg text-text-primary hover:bg-background-secondary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentStep < totalSteps - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
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
