import { getTranslations } from "next-intl/server";
import { projectsApi } from "@/lib/api/projects";
import { ProjectsPageClient } from "./ProjectsPage";
import { createClient } from "@/lib/supabase-server";
import type { ProjectWithRelations, UserRole } from "@sumbi/shared-types";


export default async function ProjectsPage() {
  const t = await getTranslations();

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  const userId = user?.id || null;

  let userRole: UserRole = 'student';
  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    userRole = userData?.role || 'student';
  }

  let projects: ProjectWithRelations[] = [];
  try {
    projects = await projectsApi.getAllProjects();
  } catch (error) {
    console.error('[ProjectsPage] Error fetching projects:', error);
  }

  return (
    <div className="w-full">
      <ProjectsPageClient
        projects={projects}
        userRole={userRole}
        userId={userId}
      />
    </div>
  );
}
