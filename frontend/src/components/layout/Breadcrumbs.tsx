"use client";

import { Breadcrumb, BreadcrumbItem } from "flowbite-react";
import { usePathname } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { useEffect, useState } from "react";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const t = useTranslations();
  const [entityNames, setEntityNames] = useState<Record<string, string>>({});

  const pathSegments = pathname
    .split("/")
    .filter((segment) => segment);

  if (pathSegments.length === 0 || pathSegments[0] === "auth") {
    return null;
  }

  useEffect(() => {
    const fetchEntityNames = async () => {
      const names: Record<string, string> = {};

      for (let i = 0; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        const parentSegment = pathSegments[i - 1];
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);

        if (isUUID) {
          try {
            const { apiRequestBrowser } = await import("@/lib/api/client-browser");

            if (parentSegment === "users") {
              const user = await apiRequestBrowser<any>(`/users/${segment}`);
              names[segment] = user.full_name || user.email;
            } else if (parentSegment === "projects") {
              const project = await apiRequestBrowser<any>(`/projects/${segment}`);
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

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
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
    };

    return translations[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = getSegmentLabel(segment, index);
    const isLast = index === pathSegments.length - 1;

    return {
      href,
      label,
      isLast,
    };
  });

  return (
    <div className="bg-background-elevated border-b border-border px-6 py-3">
      <Breadcrumb aria-label="Page navigation">
        {breadcrumbItems.map((item, index) => (
          <BreadcrumbItem key={index}>
            {item.isLast ? (
              <span className="text-text-primary font-medium">{item.label}</span>
            ) : (
              <Link href={item.href} className="text-text-secondary hover:text-text-primary">
                {item.label}
              </Link>
            )}
          </BreadcrumbItem>
        ))}
      </Breadcrumb>
    </div>
  );
}
