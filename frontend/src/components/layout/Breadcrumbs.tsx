"use client";

import { usePathname } from "@/lib/navigation";
import { Link } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { formatUserName } from "@/lib/formatters";

// Modern Breadcrumbs component with chip/pill design
// Replaces traditional breadcrumb trail with contemporary chip navigation

export default function Breadcrumbs() {
  const pathname = usePathname();
  const t = useTranslations();
  const [entityNames, setEntityNames] = useState<Record<string, string>>({});

  const pathSegments = pathname.split("/").filter((segment) => segment);

  if (pathSegments.length === 0 || pathSegments[0] === "auth") {
    return null;
  }

  useEffect(() => {
    const fetchEntityNames = async () => {
      const names: Record<string, string> = {};

      for (let i = 0; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        const parentSegment = pathSegments[i - 1];
        const isUUID =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            segment
          );

        if (isUUID) {
          try {
            const { apiRequest } = await import("@/lib/api/client");

            if (parentSegment === "users") {
              const user = await apiRequest<any>(`/users/${segment}`);
              names[segment] =
                formatUserName(user.first_name, user.last_name) || user.email;
            } else if (parentSegment === "projects") {
              const project = await apiRequest<any>(`/projects/${segment}`);
              names[segment] = project.title;
            }
          } catch (error) {
            console.log(`[Breadcrumbs] Cannot fetch name for ${segment}`);
          }
        }
      }

      setEntityNames(names);
    };

    fetchEntityNames();
  }, [pathname]);

  const getSegmentLabel = (segment: string, index: number): string => {
    if (entityNames[segment]) {
      return entityNames[segment];
    }

    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        segment
      );
    if (isUUID) {
      return `${segment.substring(0, 8)}...`;
    }

    if (/^\d+$/.test(segment)) {
      const parentSegment = pathSegments[index - 1];
      if (parentSegment === "projects") {
        return `${t("sidebar.projects")} #${segment}`;
      }
      if (parentSegment === "users") {
        return `${t("users.title")} #${segment}`;
      }
      return `#${segment}`;
    }

    const translations: Record<string, string> = {
      dashboard: t("sidebar.dashboard"),
      projects: t("sidebar.projects"),
      users: t("users.title"),
      settings: "Settings",
      schools: t("sidebar.schools"),
      edit: t("common.edit") || "Edit",
      admin: t("admin.title"),
      subjects: t("admin.subjects.title"),
      scales: t("admin.scales.title"),
      years: t("admin.years.title"),
      create: t("admin.subjects.create"),
      "scale-sets": t("admin.scaleSets.title"),
    };

    return (
      translations[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1)
    );
  };

  // Segments that are tabs on /admin (no standalone page)
  const adminTabSegments = new Set(['subjects', 'scales', 'years', 'scale-sets']);

  const breadcrumbItems = pathSegments.map((segment, index) => {
    let href = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = getSegmentLabel(segment, index);
    const isLast = index === pathSegments.length - 1;

    // Redirect admin tab segments to /admin since they don't have standalone pages
    const parentSegment = pathSegments[index - 1];
    if (parentSegment === 'admin' && adminTabSegments.has(segment)) {
      href = '/admin';
    }

    return {
      href,
      label,
      isLast,
    };
  });

  return (
    <div className="bg-background-secondary/30 border-b border-border pl-16 pr-4 lg:px-8 py-4 shadow-sm">
      <div className="flex items-center gap-2 flex-wrap" aria-label="Page navigation">
        {breadcrumbItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {/* Breadcrumb Chip */}
            {item.isLast ? (
              <div className="px-3 py-1.5 bg-primary/10 text-primary font-semibold text-sm rounded-full">
                {item.label}
              </div>
            ) : (
              <Link
                href={item.href}
                className="px-3 py-1.5 bg-background-secondary text-text-secondary hover:bg-background-tertiary hover:text-text-primary font-medium text-sm rounded-full transition-all duration-200"
              >
                {item.label}
              </Link>
            )}

            {/* Separator Arrow */}
            {!item.isLast && (
              <ChevronRight className="text-text-tertiary flex-shrink-0" size={16} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
