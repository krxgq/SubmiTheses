"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ProjectWithRelations, ProjectScheduleEntry } from "@sumbi/shared-types";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { UserSelect } from "@/components/ui/UserSelect";
import { SubjectSelect } from "@/components/ui/SubjectSelect";
import { ArrayInput } from "@/components/ui/ArrayInput";
import { ScheduleBuilder } from "./createProject/ScheduleBuilder";
import { projectsApi } from "@/lib/api/projects";

interface EditProjectFormProps {
  project: ProjectWithRelations;
}

export default function EditProjectForm({ project }: EditProjectFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // @ts-ignore - subject_id exists in DB but not in type yet
  const projectSubjectId = project.subject_id || null;
  
  const [formData, setFormData] = useState({
    title: project.title || "",
    subject_id: projectSubjectId,
    topic: project.project_description?.topic || "",
    project_goal: project.project_description?.project_goal || "",
    specification: project.project_description?.specification || "",
    needed_output: project.project_description?.needed_output || [""],
    schedule: (project.project_description?.schedule as unknown as ProjectScheduleEntry[]) || [],
    supervisor_id: project.supervisor_id,
    opponent_id: project.opponent_id,
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Project title is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        subject_id: formData.subject_id,
        supervisor_id: formData.supervisor_id,
        opponent_id: formData.opponent_id,

        project_description: {
          topic: formData.topic,
          project_goal: formData.project_goal,
          specification: formData.specification,
          needed_output: formData.needed_output.filter(item => item.trim() !== ""),
          schedule: formData.schedule.length > 0 ? formData.schedule : undefined,
        },
      };

      await projectsApi.updateProject(Number(project.id), payload);
      toast.success("Project updated successfully!");
      router.push(`/projects/${project.id}`);
    } catch (error: any) {
      console.error("Failed to update project:", error);
      toast.error(error.message || "Failed to update project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/projects/${project.id}`);
  };

  return (
    <div className="bg-background-elevated w-full max-w-4xl mx-auto p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">Edit Project</h1>
        <p className="text-sm text-text-secondary mt-1">Update project details and description</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-text-primary border-b border-border pb-2">
            Basic Information
          </h2>
          
          <Input
            label="Project Title"
            id="title"
            name="title"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            required
          />

          <SubjectSelect
            label="Subject"
            id="subject"
            value={formData.subject_id}
            onChange={(subjectId) => updateField("subject_id", subjectId)}
            required
          />
        </div>

        {/* Topic & Goals */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-text-primary border-b border-border pb-2">
            Topic & Goals
          </h2>

          <Input
            label="Project Topic"
            id="topic"
            name="topic"
            value={formData.topic}
            onChange={(e) => updateField("topic", e.target.value)}
          />

          <Textarea
            label="Project Goal"
            id="project_goal"
            name="project_goal"
            rows={6}
            value={formData.project_goal}
            onChange={(e) => updateField("project_goal", e.target.value)}
          />
        </div>

        {/* Specification & Outputs */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-text-primary border-b border-border pb-2">
            Specification & Required Outputs
          </h2>

          <RichTextEditor
            label="Project Specification"
            id="specification"
            value={formData.specification}
            onChange={(value) => updateField("specification", value)}
            minHeight={250}
          />

          <ArrayInput
            label="Required Outputs"
            value={formData.needed_output}
            onChange={(items) => updateField("needed_output", items)}
            placeholder="Enter output item"
            minItems={1}
          />
        </div>

        {/* Schedule */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-text-primary border-b border-border pb-2">
            Timeline
          </h2>

          <ScheduleBuilder
            value={formData.schedule}
            onChange={(schedule) => updateField("schedule", schedule)}
          />
        </div>

        {/* Team Selection */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-text-primary border-b border-border pb-2">
            Team Selection
          </h2>

          <UserSelect
            label="Supervisor"
            id="supervisor"
            value={formData.supervisor_id}
            onChange={(userId) => updateField("supervisor_id", userId)}
            excludeUserId={formData.opponent_id || undefined}
            required
          />

          <UserSelect
            label="Opponent"
            id="opponent"
            value={formData.opponent_id}
            onChange={(userId) => updateField("opponent_id", userId)}
            excludeUserId={formData.supervisor_id || undefined}
            required={false}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-6 py-2 border border-border rounded-lg text-text-primary hover:bg-background-secondary transition-colors duration-200 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Updating...
              </>
            ) : (
              "Update Project"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
