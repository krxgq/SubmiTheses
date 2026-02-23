"use client";

import { useState, useMemo } from "react";
import {
  LayoutList,
  LayoutGrid,
  Plus,
  FolderOpen,
  Search,
  Heart,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
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

// Role-filtered projects within a single year
interface RoleFilteredProjects {
  myProjects: ProjectWithRelations[];
  supervisor: ProjectWithRelations[];
  opponent: ProjectWithRelations[];
  other: ProjectWithRelations[];
}

// A year group containing role-filtered sub-sections
interface YearGroup {
  yearId: string;
  yearName: string;
  total: number;
  roles: RoleFilteredProjects;
}

function filterByRole(
  projects: ProjectWithRelations[],
  userId: string | null,
): RoleFilteredProjects {
  if (!userId) {
    return { myProjects: [], supervisor: [], opponent: [], other: projects };
  }

  const myProjects = projects.filter((p) => p.student_id === userId);
  const supervisor = projects.filter((p) => p.supervisor_id === userId);
  const opponent = projects.filter((p) => p.opponent_id === userId);

  // Collect all project IDs where user has a direct role
  const involvedIds = new Set([
    ...myProjects.map((p) => p.id),
    ...supervisor.map((p) => p.id),
    ...opponent.map((p) => p.id),
  ]);

  const other = projects.filter((p) => !involvedIds.has(p.id));

  return { myProjects, supervisor, opponent, other };
}

/**
 * Groups projects by their academic year.
 * Returns a Map where key = yearId (or "unassigned"), value = { yearName, projects[] }.
 * Projects without a year go under the "unassigned" key.
 * Years are sorted newest first (by year name descending), unassigned goes last.
 *
 * Each project has: project.year?.name (string|null), project.year_id (bigint|null)
 */
function groupProjectsByYear(
  projects: ProjectWithRelations[],
  noYearLabel: string,
): Map<string, { yearName: string; projects: ProjectWithRelations[] }> {
  const unsorted = new Map<string, { yearName: string; projects: ProjectWithRelations[] }>();

  for (const project of projects) {
    const key = project.year_id != null ? String(project.year_id) : "unassigned";
    const name = project.year?.name ?? noYearLabel;

    if (!unsorted.has(key)) {
      unsorted.set(key, { yearName: name, projects: [] });
    }
    unsorted.get(key)!.projects.push(project);
  }

  // Sort entries: named years descending (e.g. "2025/2026" before "2024/2025"), unassigned last
  const sorted = [...unsorted.entries()].sort(([keyA], [keyB]) => {
    if (keyA === "unassigned") return 1;
    if (keyB === "unassigned") return -1;
    return keyB.localeCompare(keyA);
  });

  return new Map(sorted);
}

// Groups all projects by year, then applies role filtering within each group
function useProjectsByYear(
  projects: ProjectWithRelations[],
  userId: string | null,
  noYearLabel: string,
): YearGroup[] {
  return useMemo(() => {
    const yearMap = groupProjectsByYear(projects, noYearLabel);

    // Convert Map entries to YearGroup array with role sub-filtering
    return Array.from(yearMap.entries()).map(
      ([yearId, { yearName, projects: yearProjects }]) => ({
        yearId,
        yearName,
        total: yearProjects.length,
        roles: filterByRole(yearProjects, userId),
      }),
    );
  }, [projects, userId, noYearLabel]);
}

/**
 * Client component for projects page with year-grouped, role-filtered layout.
 *
 * Structure:
 * - Collapsible year sections (newest first)
 *   - My Projects (student)
 *   - As Supervisor
 *   - As Opponent
 *   - Other Projects
 * - Search bar filters across all years
 * - Grid/List view toggle
 */
export function ProjectsPageClient({
  projects,
  userRole,
  userId,
}: ProjectsPageClientProps) {
  const t = useTranslations();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  // Tracks which year sections are collapsed (all expanded by default)
  const [collapsedYears, setCollapsedYears] = useState<Set<string>>(new Set());

  // Filter projects by search query before grouping
  const searchedProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.student?.first_name?.toLowerCase().includes(q) ||
        p.student?.last_name?.toLowerCase().includes(q) ||
        p.supervisor?.first_name?.toLowerCase().includes(q) ||
        p.supervisor?.last_name?.toLowerCase().includes(q),
    );
  }, [projects, searchQuery]);

  // Group by year, then filter by role within each year
  const yearGroups = useProjectsByYear(
    searchedProjects,
    userId,
    t("projects.noYearAssigned"),
  );

  const hasAnyProjects = yearGroups.some((yg) => yg.total > 0);

  // Toggle collapse/expand for a year section
  const toggleYear = (yearId: string) => {
    setCollapsedYears((prev) => {
      const next = new Set(prev);
      if (next.has(yearId)) next.delete(yearId);
      else next.add(yearId);
      return next;
    });
  };

  // Renders project cards in grid or list layout
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

    return (
      <div className="space-y-4">
        {projectsList.map((project) => (
          <ListItem key={project.id} project={project} role={userRole} />
        ))}
      </div>
    );
  };

  // Renders a role sub-section within a year group (hidden if empty)
  const renderRoleSection = (
    title: string,
    projectsList: ProjectWithRelations[],
  ) => {
    if (projectsList.length === 0) return null;

    return (
      <div className="mb-8 last:mb-0">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-medium text-text-secondary">{title}</h3>
          <span className="px-2.5 py-0.5 bg-background-tertiary text-text-secondary rounded-full text-xs font-medium">
            {projectsList.length}
          </span>
        </div>
        {renderProjectsGrid(projectsList)}
      </div>
    );
  };

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8 sm:mb-12">
        <div className="space-y-2 min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            {t("sidebar.projects")}
          </h1>
          <p className="text-sm sm:text-base text-text-secondary">
            {t("projects.manageYourProjects")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Create project - teachers and admins only */}
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

          {/* Browse topics - students only */}
          {userRole === "student" && (
            <Button
              variant="primary"
              size="md"
              leftIcon={<Heart size={20} />}
              onClick={() => router.push("/projects/available")}
            >
              {t("projects.browseAvailableTopics")}
            </Button>
          )}

          {/* Grid/List view toggle */}
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

      {/* Search bar */}
      <div className="relative mb-8">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
        />
        <input
          type="text"
          placeholder={t("projects.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-background-secondary border border-border-primary rounded-xl text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary transition-all"
        />
      </div>

      {/* Year-grouped sections */}
      {yearGroups.map((yearGroup) => {
        const isCollapsed = collapsedYears.has(yearGroup.yearId);
        const { roles } = yearGroup;

        if (yearGroup.total === 0) return null;

        return (
          <div
            key={yearGroup.yearId}
            className="mb-8 border border-border-primary rounded-2xl overflow-hidden"
          >
            {/* Collapsible year header */}
            <button
              onClick={() => toggleYear(yearGroup.yearId)}
              className="w-full flex items-center justify-between px-6 py-4 bg-background-secondary hover:bg-background-tertiary transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {isCollapsed ? (
                  <ChevronRight size={20} className="text-text-secondary" />
                ) : (
                  <ChevronDown size={20} className="text-text-secondary" />
                )}
                <h2 className="text-xl font-semibold text-text-primary">
                  {yearGroup.yearName}
                </h2>
              </div>
              <span className="px-3 py-1 bg-background-elevated text-text-secondary rounded-full text-sm font-medium">
                {yearGroup.total}
              </span>
            </button>

            {/* Role sub-sections (visible when year is expanded) */}
            {!isCollapsed && (
              <div className="px-6 py-6">
                {renderRoleSection(
                  t("projects.sections.myProjects"),
                  roles.myProjects,
                )}
                {renderRoleSection(
                  t("projects.sections.supervisor"),
                  roles.supervisor,
                )}
                {renderRoleSection(
                  t("projects.sections.opponent"),
                  roles.opponent,
                )}
                {renderRoleSection(
                  t("projects.sections.other"),
                  roles.other,
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Empty state when no projects match */}
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
    </>
  );
}
