"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/lib/navigation";
import { Button, Dropdown, DropdownItem } from "flowbite-react";
import { Plus, MoreVertical } from "lucide-react";
import type { ScaleSet } from "@/lib/api/scale-sets";
import { deleteScaleSet } from "@/lib/api/scale-sets";
import { useApi } from "@/hooks/useApi";
import { toast } from "sonner";

interface ScaleSetsTableProps {
  scaleSets: ScaleSet[];
}

export function ScaleSetsTable({ scaleSets }: ScaleSetsTableProps) {
  const t = useTranslations("admin.scaleSets");
  const router = useRouter();
  const [roleFilter, setRoleFilter] = useState<
    "all" | "supervisor" | "opponent"
  >("all");

  const { execute: performDelete, loading: isDeleting } = useApi<
    [bigint],
    void
  >(deleteScaleSet);

  const filteredScaleSets = useMemo(() => {
    return scaleSets.filter((scaleSet) => {
      if (roleFilter === "all") return true;
      return scaleSet.project_role === roleFilter;
    });
  }, [scaleSets, roleFilter]);

  const handleDelete = async (id: bigint, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await performDelete(id);
      toast.success(`Scale set "${name}" deleted successfully.`);
      router.refresh();
    } catch (err) {
      toast.error("Failed to delete scale set.");
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">{t("title")}</h1>
        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="rounded-lg border border-border bg-background-elevated px-3 py-2 text-sm text-text-primary"
          >
            <option value="all">All Roles</option>
            <option value="supervisor">Supervisor</option>
            <option value="opponent">Opponent</option>
          </select>

          <Link href="/admin/scale-sets/create">
            <Button
              size="sm"
              className="bg-primary hover:bg-primary-hover text-text-inverse px-6 py-2.5 rounded-lg font-medium transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("create")}
            </Button>
          </Link>
        </div>
      </div>

      {filteredScaleSets.length > 0 ? (
        <div className="bg-background-elevated rounded-xl shadow-sm border border-border overflow-visible">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-background-secondary border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-text-primary font-semibold">
                    {t("name")}
                  </th>
                  <th className="px-6 py-3 text-text-primary font-semibold">
                    {t("year")}
                  </th>
                  <th className="px-6 py-3 text-text-primary font-semibold">
                    {t("role")}
                  </th>
                  <th className="px-6 py-3 text-text-primary font-semibold">
                    Scales
                  </th>
                  <th className="px-6 py-3 text-text-primary font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredScaleSets.map((scaleSet) => (
                  <tr
                    key={String(scaleSet.id)}
                    className="hover:bg-background-hover transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-text-primary">
                      {scaleSet.name}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {scaleSet.years?.name || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          scaleSet.project_role === "supervisor"
                            ? "bg-primary/10 text-primary"
                            : "bg-accent/10 text-accent"
                        }`}
                      >
                        {scaleSet.project_role === "supervisor"
                          ? t("supervisor")
                          : t("opponent")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {scaleSet._count?.scale_set_scales ||
                        scaleSet.scale_set_scales?.length ||
                        0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Dropdown
                        label={
                          <MoreVertical className="w-5 h-5 text-text-secondary" />
                        }
                        arrowIcon={false}
                        inline
                        size="sm"
                      >
                        <DropdownItem
                          as={Link}
                          href={`/admin/scale-sets/${scaleSet.id}/edit`}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          onClick={() =>
                            handleDelete(scaleSet.id, scaleSet.name)
                          }
                          className="text-danger"
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </DropdownItem>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-background-elevated rounded-xl shadow-sm border border-border p-12">
          <div className="text-center">
            <p className="text-text-secondary">No scale sets found.</p>
          </div>
        </div>
      )}
    </div>
  );
}
