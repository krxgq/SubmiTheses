"use client";

import { useState, useMemo } from "react";
import {
  LayoutList,
  LayoutGrid,
  Search,
  FolderOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type { ProjectWithRelations } from "@sumbi/shared-types";
import { GridItem } from "@/components/dashboard/projects/GridItem";
import { ListItem } from "@/components/dashboard/projects/ListItem";
import { useTranslations } from "next-intl";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EmptyState } from "@/components/ui/EmptyState";

type ViewMode = "list" | "grid";

interface GalleryPageClientProps {
  projects: ProjectWithRelations[];
}

// Group projects by academic year (newest first, unassigned last)
function groupByYear(
  projects: ProjectWithRelations[],
  noYearLabel: string,
): Array<{ yearId: string; yearName: string; projects: ProjectWithRelations[] }> {
  const map = new Map<string, { yearName: string; projects: ProjectWithRelations[] }>();

  for (const project of projects) {
    const key = project.year_id != null ? String(project.year_id) : "unassigned";
    const name = project.year?.name ?? noYearLabel;
    if (!map.has(key)) map.set(key, { yearName: name, projects: [] });
    map.get(key)!.projects.push(project);
  }

  // Sort: named years descending, unassigned last
  const sorted = [...map.entries()].sort(([a], [b]) => {
    if (a === "unassigned") return 1;
    if (b === "unassigned") return -1;
    return b.localeCompare(a);
  });

  return sorted.map(([yearId, { yearName, projects }]) => ({ yearId, yearName, projects }));
}

/**
 * Client component for the public gallery — read-only project browsing.
 * No role filtering, no action buttons, no auth context.
 * Reuses GridItem/ListItem components from the dashboard.
 */
export function GalleryPageClient({ projects }: GalleryPageClientProps) {
  const t = useTranslations();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedYears, setCollapsedYears] = useState<Set<string>>(new Set());

  // Filter by search query
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.supervisor?.first_name?.toLowerCase().includes(q) ||
        p.supervisor?.last_name?.toLowerCase().includes(q),
    );
  }, [projects, searchQuery]);

  const yearGroups = useMemo(
    () => groupByYear(filtered, t("projects.noYearAssigned")),
    [filtered, t],
  );

  const toggleYear = (yearId: string) => {
    setCollapsedYears((prev) => {
      const next = new Set(prev);
      next.has(yearId) ? next.delete(yearId) : next.add(yearId);
      return next;
    });
  };

  // Render project cards with /gallery links instead of /projects
  const renderProjects = (list: ProjectWithRelations[]) => {
    if (viewMode === "grid") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((project) => (
            <GridItem key={project.id} project={project} role="student" basePath="/gallery" />
          ))}
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {list.map((project) => (
          <ListItem key={project.id} project={project} role="student" basePath="/gallery" />
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Page header — no action buttons, just title + view toggle */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8 sm:mb-12">
        <div className="space-y-2 min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            {t("sidebar.projects")}
          </h1>
          <p className="text-sm sm:text-base text-text-secondary">
            {t("projects.manageYourProjects")}
          </p>
        </div>
        <SegmentedControl
          options={[
            { value: "grid", label: "Grid", icon: LayoutGrid },
            { value: "list", label: "List", icon: LayoutList },
          ]}
          value={viewMode}
          onChange={(v) => setViewMode(v as ViewMode)}
        />
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          placeholder={t("projects.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-background-secondary border border-border-primary rounded-xl text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary transition-all"
        />
      </div>

      {/* Year-grouped project list */}
      {yearGroups.map(({ yearId, yearName, projects: yearProjects }) => {
        const isCollapsed = collapsedYears.has(yearId);
        return (
          <div key={yearId} className="mb-8 border border-border-primary rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleYear(yearId)}
              className="w-full flex items-center justify-between px-6 py-4 bg-background-secondary hover:bg-background-tertiary transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {isCollapsed ? <ChevronRight size={20} className="text-text-secondary" /> : <ChevronDown size={20} className="text-text-secondary" />}
                <h2 className="text-xl font-semibold text-text-primary">{yearName}</h2>
              </div>
              <span className="px-3 py-1 bg-background-elevated text-text-secondary rounded-full text-sm font-medium">
                {yearProjects.length}
              </span>
            </button>
            {!isCollapsed && (
              <div className="px-6 py-6">{renderProjects(yearProjects)}</div>
            )}
          </div>
        );
      })}

      {/* Empty state */}
      {yearGroups.length === 0 && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <EmptyState
            icon={FolderOpen}
            title={t("projects.noProjectsFound")}
            description={t("projects.noProjectsDescription")}
            className="max-w-md"
          />
        </div>
      )}
    </>
  );
}
