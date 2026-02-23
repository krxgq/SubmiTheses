"use client";

import { useState, useEffect } from "react";
import {
  LayoutList,
  LayoutGrid,
  ArrowLeft,
  Heart,
  HeartOff,
  User,
  Calendar,
  Loader2,
  FolderOpen,
  CheckCircle,
} from "lucide-react";
import type { ProjectWithRelations } from "@sumbi/shared-types";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/navigation";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EmptyState } from "@/components/ui/EmptyState";
import { projectsApi } from "@/lib/api/projects";
import { toast } from "sonner";

type ViewMode = "list" | "grid";

interface AvailableTopicsClientProps {
  projects: ProjectWithRelations[];
  userId: string | null;
  studentHasProject: boolean;
}

// Track signup status for each project
interface SignupStatus {
  [projectId: string]: boolean;
}

export function AvailableTopicsClient({
  projects,
  userId,
  studentHasProject,
}: AvailableTopicsClientProps) {
  const t = useTranslations();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [signupStatus, setSignupStatus] = useState<SignupStatus>({});
  const [loadingSignups, setLoadingSignups] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Load signup status for all projects on mount (skip if student already has a project)
  useEffect(() => {
    // If student already has a project, no need to check signup status
    if (studentHasProject) {
      setLoadingSignups(false);
      return;
    }

    const loadSignupStatuses = async () => {
      const statuses: SignupStatus = {};

      await Promise.all(
        projects.map(async (project) => {
          try {
            const { signedUp } = await projectsApi.getSignupStatus(String(project.id));
            statuses[String(project.id)] = signedUp;
          } catch (error) {
            statuses[String(project.id)] = false;
          }
        })
      );

      setSignupStatus(statuses);
      setLoadingSignups(false);
    };

    if (projects.length > 0) {
      loadSignupStatuses();
    } else {
      setLoadingSignups(false);
    }
  }, [projects, studentHasProject]);

  const handleSignup = async (projectId: string) => {
    setProcessingId(projectId);
    try {
      await projectsApi.signupForProject(projectId);
      setSignupStatus((prev) => ({ ...prev, [projectId]: true }));
      toast.success(t("projectDetail.actions.signups.signupSuccess"));
    } catch (error: any) {
      toast.error(error.message || t("projectDetail.actions.signups.signupFailed"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelSignup = async (projectId: string) => {
    setProcessingId(projectId);
    try {
      await projectsApi.cancelSignup(projectId);
      setSignupStatus((prev) => ({ ...prev, [projectId]: false }));
      toast.success(t("projectDetail.actions.signups.signupCancelled"));
    } catch (error: any) {
      toast.error(error.message || t("projectDetail.actions.signups.cancelFailed"));
    } finally {
      setProcessingId(null);
    }
  };

  const formatSupervisorName = (project: ProjectWithRelations) => {
    if (!project.supervisor) return t("common.unassigned");
    const { first_name, last_name, email } = project.supervisor;
    if (first_name || last_name) {
      return `${first_name || ""} ${last_name || ""}`.trim();
    }
    return email;
  };

  // Render a single topic card
  const renderTopicCard = (project: ProjectWithRelations) => {
    const projectId = String(project.id);
    const isSignedUp = signupStatus[projectId];
    const isProcessing = processingId === projectId;

    return (
      <div
        key={project.id}
        className="bg-background-elevated border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all group flex flex-col h-full"
      >
        {/* Card header - clickable to open project, grows to fill space */}
        <div
          onClick={() => router.push(`/projects/${project.id}`)}
          className="p-5 cursor-pointer flex-1"
        >
          <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {project.title}
          </h3>

          {/* Supervisor info */}
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-3">
            <User size={14} />
            <span>{formatSupervisorName(project)}</span>
          </div>

          {/* Description preview */}
          {project.description && (
            <p className="text-sm text-text-secondary line-clamp-2 mb-3">
              {project.description}
            </p>
          )}

          {/* Subject badge */}
          {project.subject && (
            <span className="inline-block px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
              {project.subject}
            </span>
          )}
        </div>

        {/* Card footer with signup button - pinned to bottom */}
        <div className="px-5 pb-5 pt-0 mt-auto">
          <div className="border-t border-border pt-4">
            {studentHasProject ? (
              // Student already has a project - show info message
              <div className="flex items-center justify-center gap-2 py-2.5 text-sm text-text-secondary">
                <CheckCircle size={16} className="text-success" />
                <span>{t("projects.alreadyHasProject")}</span>
              </div>
            ) : loadingSignups ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="w-5 h-5 animate-spin text-text-secondary" />
              </div>
            ) : isSignedUp ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelSignup(projectId);
                }}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-warning bg-warning/10 rounded-lg hover:bg-warning/20 transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <HeartOff size={16} />
                )}
                <span>
                  {isProcessing
                    ? t("projectDetail.actions.signups.cancelling")
                    : t("projectDetail.actions.signups.cancelSignup")}
                </span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSignup(projectId);
                }}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Heart size={16} />
                )}
                <span>
                  {isProcessing
                    ? t("projectDetail.actions.signups.signingUp")
                    : t("projectDetail.actions.signups.signUp")}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render topic in list view
  const renderTopicListItem = (project: ProjectWithRelations) => {
    const projectId = String(project.id);
    const isSignedUp = signupStatus[projectId];
    const isProcessing = processingId === projectId;

    return (
      <div
        key={project.id}
        className="bg-background-elevated border border-border rounded-xl p-5 hover:border-primary/50 transition-all flex items-center gap-4"
      >
        {/* Main content - clickable */}
        <div
          onClick={() => router.push(`/projects/${project.id}`)}
          className="flex-1 min-w-0 cursor-pointer"
        >
          <h3 className="text-lg font-semibold text-text-primary hover:text-primary transition-colors truncate">
            {project.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-text-secondary mt-1">
            <span className="flex items-center gap-1">
              <User size={14} />
              {formatSupervisorName(project)}
            </span>
            {project.subject && (
              <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                {project.subject}
              </span>
            )}
          </div>
        </div>

        {/* Signup button */}
        <div className="flex-shrink-0">
          {studentHasProject ? (
            <div className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary">
              <CheckCircle size={16} className="text-success" />
              <span className="hidden sm:inline">{t("projects.alreadyHasProject")}</span>
            </div>
          ) : loadingSignups ? (
            <Loader2 className="w-5 h-5 animate-spin text-text-secondary" />
          ) : isSignedUp ? (
            <button
              onClick={() => handleCancelSignup(projectId)}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-warning bg-warning/10 rounded-lg hover:bg-warning/20 transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <HeartOff size={16} />
              )}
              <span className="hidden sm:inline">
                {t("projectDetail.actions.signups.cancelSignup")}
              </span>
            </button>
          ) : (
            <button
              onClick={() => handleSignup(projectId)}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Heart size={16} />
              )}
              <span className="hidden sm:inline">
                {t("projectDetail.actions.signups.signUp")}
              </span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8 sm:mb-12">
        {/* Left: Back button, Title and Subtitle */}
        <div className="space-y-2 min-w-0 flex-1">
          <button
            onClick={() => router.push("/projects")}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-2"
          >
            <ArrowLeft size={16} />
            <span>{t("projects.backToProjects")}</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            {t("projects.availableTopics")}
          </h1>
          <p className="text-sm sm:text-base text-text-secondary">
            {t("projects.availableTopicsDescription")}
          </p>
        </div>

        {/* Right: View toggle */}
        <div className="flex items-center gap-3">
          <SegmentedControl
            options={[
              { value: "grid", label: "Grid", icon: LayoutGrid },
              { value: "list", label: "List", icon: LayoutList },
            ]}
            value={viewMode}
            onChange={(value) => setViewMode(value as ViewMode)}
          />
        </div>
      </div>

      {/* Topics count */}
      {projects.length > 0 && (
        <div className="mb-6 text-sm text-text-secondary">
          {t("projects.availableTopicsCount", { count: projects.length })}
        </div>
      )}

      {/* Topics Grid/List */}
      {projects.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {projects.map(renderTopicCard)}
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map(renderTopicListItem)}
          </div>
        )
      ) : (
        <div className="flex items-center justify-center min-h-[50vh]">
          <EmptyState
            icon={FolderOpen}
            title={t("projects.noAvailableTopics")}
            description={t("projects.noAvailableTopicsDescription")}
            className="max-w-md"
          />
        </div>
      )}
    </>
  );
}
