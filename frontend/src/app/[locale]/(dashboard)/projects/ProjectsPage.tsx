"use client";

import { useState, useMemo, useCallback } from "react";
import {
  LayoutList,
  LayoutGrid,
  Plus,
  FolderOpen,
  Search,
  Heart,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  X,
  Send,
  Loader2,
} from "lucide-react";
import type { ProjectWithRelations, UserRole } from "@sumbi/shared-types";
import { GridItem } from "@/components/dashboard/projects/GridItem";
import { ListItem } from "@/components/dashboard/projects/ListItem";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/navigation";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EmptyState } from "@/components/ui/EmptyState";
import { projectsApi } from "@/lib/api/projects";
import { toast } from "sonner";

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
  // Local copy of projects so we can update statuses without full page reload
  const [localProjects, setLocalProjects] = useState(projects);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  // Tracks which year sections are collapsed (all expanded by default)
  const [collapsedYears, setCollapsedYears] = useState<Set<string>>(new Set());
  // Selection mode state (admin only)
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isPublishing, setIsPublishing] = useState(false);

  // Toggle a single project in/out of the selection set
  const toggleSelect = useCallback((id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Exit select mode and clear selection
  const exitSelectMode = useCallback(() => {
    setSelectMode(false);
    setSelectedIds(new Set());
  }, []);

  // Bulk publish: validates on frontend first, then calls API for eligible projects
  const handleBulkPublish = useCallback(async () => {
    if (selectedIds.size === 0) return;

    // Split selected projects by current status before calling the API
    const selectedProjects = localProjects.filter(p => selectedIds.has(Number(p.id)));
    const lockedIds: number[] = [];

    for (const p of selectedProjects) {
      const id = Number(p.id);
      if (p.status === 'public') {
        // Already published — toast and skip
        toast.info(t('projects.alreadyPublished', { name: p.title }));
      } else if (p.status !== 'locked') {
        // Draft or other — can't publish
        toast.warning(t('projects.bulkPublishSkippedProject', { name: p.title }));
      } else {
        lockedIds.push(id);
      }
    }

    // Nothing eligible — just exit select mode
    if (lockedIds.length === 0) {
      exitSelectMode();
      return;
    }

    setIsPublishing(true);
    try {
      const result = await projectsApi.bulkPublish(lockedIds);

      if (result.published > 0) {
        toast.success(t('projects.bulkPublishSuccess', { count: result.published }));
        // Update local project statuses so badges reflect the change instantly
        const publishedIds = new Set(
          result.results.filter(r => r.status === 'published').map(r => r.id)
        );
        setLocalProjects(prev =>
          prev.map(p => publishedIds.has(Number(p.id)) ? { ...p, status: 'public' } : p)
        );
      }

      // Show toast for any that failed on the backend side
      for (const r of result.results.filter(r => r.status === 'failed')) {
        const proj = localProjects.find(p => Number(p.id) === r.id);
        toast.error(t('projects.bulkPublishFailedProject', { name: proj?.title ?? `#${r.id}` }));
      }

      exitSelectMode();
    } catch {
      toast.error(t('projects.bulkPublishFailed'));
    } finally {
      setIsPublishing(false);
    }
  }, [selectedIds, t, exitSelectMode, localProjects]);

  // Filter projects by search query before grouping
  const searchedProjects = useMemo(() => {
    if (!searchQuery.trim()) return localProjects;
    const q = searchQuery.toLowerCase();
    return localProjects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.student?.first_name?.toLowerCase().includes(q) ||
        p.student?.last_name?.toLowerCase().includes(q) ||
        p.supervisor?.first_name?.toLowerCase().includes(q) ||
        p.supervisor?.last_name?.toLowerCase().includes(q),
    );
  }, [localProjects, searchQuery]);

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

  // Renders project cards in grid or list layout, with optional selection props
  const renderProjectsGrid = (projectsList: ProjectWithRelations[]) => {
    if (viewMode === "grid") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsList.map((project) => (
            <GridItem
              key={project.id}
              project={project}
              role={userRole}
              selectable={selectMode}
              selected={selectedIds.has(Number(project.id))}
              onSelect={toggleSelect}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {projectsList.map((project) => (
          <ListItem
            key={project.id}
            project={project}
            role={userRole}
            selectable={selectMode}
            selected={selectedIds.has(Number(project.id))}
            onSelect={toggleSelect}
          />
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
          {/* Select mode toggle — admin only */}
          {userRole === "admin" && (
            selectMode ? (
              <Button
                variant="outline"
                size="md"
                leftIcon={<X size={20} />}
                onClick={exitSelectMode}
              >
                {t("projects.cancelSelection")}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="md"
                leftIcon={<CheckSquare size={20} />}
                onClick={() => setSelectMode(true)}
              >
                {t("projects.selectProjects")}
              </Button>
            )
          )}

          {/* Create project - teachers and admins only */}
          {(userRole === "teacher" || userRole === "admin") && !selectMode && (
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

      {/* Floating action bar — visible when projects are selected */}
      {selectMode && selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-background-elevated border border-border-strong rounded-2xl shadow-lg px-6 py-3 flex items-center gap-4">
          <span className="text-sm font-medium text-text-primary">
            {t("projects.selectedCount", { count: selectedIds.size })}
          </span>
          <Button
            variant="primary"
            size="sm"
            leftIcon={isPublishing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            onClick={handleBulkPublish}
            disabled={isPublishing}
          >
            {t("projects.publishSelected")}
          </Button>
        </div>
      )}
    </>
  );
}
