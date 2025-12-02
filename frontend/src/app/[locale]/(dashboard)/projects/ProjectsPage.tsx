"use client";

import { useState, useMemo } from "react";
import { LayoutList, LayoutGrid, Plus } from "lucide-react";
import type { ProjectWithRelations, UserRole } from "@sumbi/shared-types";
import { GridItem } from "@/components/dashboard/projects/GridItem";
import { ListItem } from "@/components/dashboard/projects/ListItem";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/navigation";
import { Button } from "flowbite-react";

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsList.map((project) => (
            <GridItem key={project.id} project={project} role={userRole} />
          ))}
        </div>
      );
    }

    // List view - horizontal cards
    return (
      <div className="space-y-3">
        {projectsList.map((project) => (
          <ListItem key={project.id} project={project} role={userRole} />
        ))}
      </div>
    );
  };

  // Render a section with header and projects (only if non-empty)
  const renderSection = (
    title: string,
    projectsList: ProjectWithRelations[],
  ) => {
    if (projectsList.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-text-primary mb-4 pb-2 border-b border-border">
          {title}
        </h2>
        {renderProjectsGrid(projectsList)}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Header section with create button and view toggle */}
      <div className="flex justify-between items-center mb-8">
        {/* Create project button - only for teachers and admins */}
        {(userRole === "teacher" || userRole === "admin") && (
          <button
            onClick={() => router.push("/projects/create")}
            className="
              flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium
              bg-primary text-text-inverse
              hover:bg-primary-hover
              active:bg-primary-active
              transition-all duration-200 ease-in-out
              shadow-sm hover:shadow-md
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
            "
          >
            <Plus className="w-5 h-5" />
            <span>{t("projects.createNewProject")}</span>
          </button>
        )}

        {/* Spacer for when button is not shown */}
        {userRole === "student" && <div />}

        {/* View mode toggle */}
        <div className="flex items-center">
          <div className="inline-flex">
            <Button
              color="gray"
              onClick={() => setViewMode("list")}
              aria-label="List view"
              aria-pressed={viewMode === "list"}
              className={
                "rounded-l-md border border-l-0 " +
                (viewMode === "list"
                  ? "bg-background-tertiary text-text-primary"
                  : "bg-background text-text-secondary")
              }
            >
              <LayoutList className="w-5 h-5" />
            </Button>
            <Button
              color="gray"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
              className={
                "rounded-r-md border " +
                (viewMode === "grid"
                  ? "bg-background-tertiary text-text-primary"
                  : "bg-background text-text-secondary")
              }
            >
              <LayoutGrid className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Unified section-based layout for ALL roles */}
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
      {renderSection(t("projects.sections.other"), filteredProjects.other)}

      {/* Show empty state if no projects at all */}
      {!hasAnyProjects && (
        <div className="text-center py-12">
          <p className="text-text-secondary">{t("projects.noProjectsFound")}</p>
        </div>
      )}
    </div>
  );
}
