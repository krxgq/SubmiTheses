import { getTranslations } from "next-intl/server";
import { projectsApiServer } from "@/lib/api/projects";
import { AvailableTopicsClient } from "./AvailableTopicsClient";
import { checkRole } from "@/lib/auth/require-role";
import { redirect } from "next/navigation";
import type { ProjectWithRelations } from "@sumbi/shared-types";

// Server Component - fetches available topics (projects without students)
export default async function AvailableTopicsPage() {
  const t = await getTranslations();

  // Only students can access this page
  const { role, userId } = await checkRole();
  if (role !== "student") {
    redirect("/projects");
  }

  let projects: ProjectWithRelations[] = [];
  let studentHasProject = false;

  try {
    const allProjects = await projectsApiServer.getAllProjects();

    // Check if current student already has a project assigned
    studentHasProject = allProjects.some((p) => p.student_id === userId);

    // Filter to only show available topics: no student assigned, draft status
    projects = allProjects.filter(
      (p) => !p.student_id && p.status === "draft"
    );
  } catch (error) {
    console.error("[AvailableTopicsPage] Error fetching projects:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      <AvailableTopicsClient
        projects={projects}
        userId={userId}
        studentHasProject={studentHasProject}
      />
    </div>
  );
}
