"use client";

import { useState, useMemo } from "react";
import { LayoutList, LayoutGrid, Plus, Folder, FolderOpen, Search } from "lucide-react";
import type { ProjectWithRelations, UserRole } from "@sumbi/shared-types";
import { GridItem } from "@/components/dashboard/projects/GridItem";
import { ListItem } from "@/components/dashboard/projects/ListItem";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/navigation";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EmptyState } from "@/components/ui/EmptyState";

type ViewMode = "list" | "grid";

interface ProjectsPageClientProps {
  projects: ProjectWithRelations[];
  userRole: UserRole;
  userId: string | null;
}

function useFilteredProjects(
  projects: ProjectWithRelations[],
  userRole: UserRole,
  userId: string | null,
) {
  return useMemo(() => {
    if (!userId)
      return {
        myProjects: [],
        supervisor: [],
        opponent: [],
        other: [],
        all: projects,
      };

    const myProjects = projects.filter(
      (project) => project.student_id === userId,
    );

    const supervisor = projects.filter(
      (project) => project.supervisor_id === userId,
    );

    const opponent = projects.filter(
      (project) => project.opponent_id === userId,
    );

    const involvedProjectIds = new Set([
      ...myProjects.map((p) => p.id),
      ...supervisor.map((p) => p.id),
      ...opponent.map((p) => p.id),
    ]);

    const other = projects.filter(
      (project) => !involvedProjectIds.has(project.id),
    );

    return { myProjects, supervisor, opponent, other, all: projects };
  }, [projects, userId]);
}

/**
 * Client component for projects page with unified section-based layout
 *
 * ALL ROLES see the same sections (conditionally rendered):
 * - My Projects (where user is student)
 * - As Supervisor (where user is supervisor)
 * - As Opponent (where user is opponent)
 * - Other Projects (all remaining projects)
 *
 * The ONLY difference between roles is the card styling:
 * - Student role → StudentCard
 * - Teacher role → TeacherCard
 * - Admin role → AdminCard (with gradient accent)
 */

export function ProjectsPageClient({
  projects,
  userRole,
  userId,
}: ProjectsPageClientProps) {
  const t = useTranslations();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Filter projects into categories (same for all roles)
  const filteredProjects = useFilteredProjects(projects, userRole, userId);

  // Check if user has any projects at all
  const hasAnyProjects =
    filteredProjects.myProjects.length > 0 ||
    filteredProjects.supervisor.length > 0 ||
    filteredProjects.opponent.length > 0 ||
    filteredProjects.other.length > 0;

  // Render projects in grid or list view
  const renderProjectsGrid = (projectsList: ProjectWithRelations[]) => {
    if (viewMode === "grid") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projectsList.map((project) => (
            <GridItem key={project.id} project={project} role={userRole} />
          ))}
        </div>
      );
    }

    // List view - horizontal cards
    return (
      <div className="space-y-4">
        {projectsList.map((project) => (
          <ListItem key={project.id} project={project} role={userRole} />
        ))}
      </div>
    );
  };

  // Render a section with header, count badge, and projects
  // Only renders if there are projects in the list
  const renderSection = (
    title: string,
    projectsList: ProjectWithRelations[],
  ) => {
    // Don't render section if empty
    if (projectsList.length === 0) return null;

    return (
      <div className="mb-12">
        {/* Section header with count badge */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
          <div className="px-3 py-1 bg-background-tertiary text-text-secondary rounded-full text-sm font-medium">
            {projectsList.length}
          </div>
        </div>

        {/* Projects grid/list */}
        {renderProjectsGrid(projectsList)}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Modern Page Header with Title/Subtitle and Controls */}
      <div className="flex items-start justify-between mb-12">
        {/* Left: Title and Subtitle */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            {t("sidebar.projects")}
          </h1>
          <p className="mt-1 text-base text-text-secondary">
            {t("projects.manageYourProjects")}
          </p>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          {/* View mode toggle with SegmentedControl */}
          <SegmentedControl
            options={[
              { value: "grid", label: "Grid", icon: LayoutGrid },
              { value: "list", label: "List", icon: LayoutList },
            ]}
            value={viewMode}
            onChange={(value) => setViewMode(value as ViewMode)}
          />

          {/* Create project button - only for teachers and admins */}
          {(userRole === "teacher" || userRole === "admin") && (
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus size={20} />}
              onClick={() => router.push("/projects/create")}
            >
              {t("projects.createNewProject")}
            </Button>
          )}
        </div>
      </div>

      {/* Unified section-based layout for ALL roles */}
      {/* Only show sections that have projects */}
      {renderSection(
        t("projects.sections.myProjects"),
        filteredProjects.myProjects,
      )}
      {renderSection(
        t("projects.sections.supervisor"),
        filteredProjects.supervisor,
      )}
      {renderSection(
        t("projects.sections.opponent"),
        filteredProjects.opponent,
      )}
      {renderSection(
        t("projects.sections.other"),
        filteredProjects.other,
      )}

      {/* Show enhanced empty state if no projects at all */}
      {!hasAnyProjects && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <EmptyState
            icon={FolderOpen}
            title={t("projects.noProjectsFound")}
            description={t("projects.noProjectsDescription")}
            action={
              (userRole === "teacher" || userRole === "admin") && (
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Plus size={20} />}
                  onClick={() => router.push("/projects/create")}
                >
                  {t("projects.createNewProject")}
                </Button>
              )
            }
            className="max-w-md"
          />
        </div>
      )}
    </div>
  );
}
