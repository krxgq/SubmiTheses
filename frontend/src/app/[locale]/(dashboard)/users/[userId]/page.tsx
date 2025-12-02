import { getTranslations } from "next-intl/server";
import { usersApi } from "@/lib/api/users";
import { projectsApi } from "@/lib/api/projects";
import { ApiError } from "@/lib/api/client";
import { checkRole } from "@/lib/auth/require-role";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Edit, Mail, User, Calendar, Briefcase } from "lucide-react";
import type { ProjectWithRelations } from "@sumbi/shared-types";

interface UserDetailPageProps {
  params: Promise<{ userId: string }>;
}

// Page component - access protected by middleware (admin/teacher only)
export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { userId } = await params;
  const t = await getTranslations();

  // Get role for conditional rendering (e.g., showing edit button)
  const { role } = await checkRole();
  const isAdmin = role === "admin";

  let user;
  let projects: ProjectWithRelations[] = [];

  try {
    user = await usersApi.getById(userId);
    projects = await projectsApi.getAllProjects();
  } catch (error) {
    console.error("[UserDetailPage] Error:", error);

    // Distinguish between 403 (access denied) and 404 (not found)
    if (error instanceof ApiError && error.statusCode === 403) {
      // 403 Forbidden - return null, layout will show AccessDenied component
      return null;
    }

    // 404 or other errors - show Next.js not found page
    notFound();
  }

  const userProjects = {
    asStudent: projects.filter((p) => p.student_id === userId),
    asSupervisor: projects.filter((p) => p.supervisor_id === userId),
    asOpponent: projects.filter((p) => p.opponent_id === userId),
  };

  const totalProjects =
    userProjects.asStudent.length +
    userProjects.asSupervisor.length +
    userProjects.asOpponent.length;

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">
          {user.full_name || "User Details"}
        </h1>
        {isAdmin && (
          <Link
            href={`/users/${userId}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-text-inverse rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit User
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-background-elevated rounded-xl shadow-sm border border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              User Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-text-secondary mt-0.5" />
                <div>
                  <p className="text-xs text-text-secondary">Full Name</p>
                  <p className="text-sm text-text-primary font-medium">
                    {user.full_name || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-text-secondary mt-0.5" />
                <div>
                  <p className="text-xs text-text-secondary">Email</p>
                  <p className="text-sm text-text-primary font-medium">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-text-secondary mt-0.5" />
                <div>
                  <p className="text-xs text-text-secondary">Role</p>
                  <p className="text-sm text-text-primary font-medium capitalize">
                    {t(`users.roles.${user.role}`)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-text-secondary mt-0.5" />
                <div>
                  <p className="text-xs text-text-secondary">Year</p>
                  <p className="text-sm text-text-primary font-medium">
                    {user.year?.id || user.year_id || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-background-elevated rounded-xl shadow-sm border border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Projects ({totalProjects})
            </h2>

            {totalProjects === 0 ? (
              <p className="text-text-secondary text-center py-8">
                No projects found for this user
              </p>
            ) : (
              <div className="space-y-6">
                {userProjects.asStudent.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-3">
                      As Student ({userProjects.asStudent.length})
                    </h3>
                    <div className="space-y-2">
                      {userProjects.asStudent.map((project) => (
                        <Link
                          key={project.id}
                          href={`/projects/${project.id}`}
                          className="block p-4 bg-background-secondary rounded-lg hover:bg-background-hover transition-colors"
                        >
                          <p className="font-medium text-text-primary">
                            {project.title}
                          </p>
                          <p className="text-sm text-text-secondary mt-1">
                            {project.subject}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {userProjects.asSupervisor.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-3">
                      As Supervisor ({userProjects.asSupervisor.length})
                    </h3>
                    <div className="space-y-2">
                      {userProjects.asSupervisor.map((project) => (
                        <Link
                          key={project.id}
                          href={`/projects/${project.id}`}
                          className="block p-4 bg-background-secondary rounded-lg hover:bg-background-hover transition-colors"
                        >
                          <p className="font-medium text-text-primary">
                            {project.title}
                          </p>
                          <p className="text-sm text-text-secondary mt-1">
                            {project.subject}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {userProjects.asOpponent.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-3">
                      As Opponent ({userProjects.asOpponent.length})
                    </h3>
                    <div className="space-y-2">
                      {userProjects.asOpponent.map((project) => (
                        <Link
                          key={project.id}
                          href={`/projects/${project.id}`}
                          className="block p-4 bg-background-secondary rounded-lg hover:bg-background-hover transition-colors"
                        >
                          <p className="font-medium text-text-primary">
                            {project.title}
                          </p>
                          <p className="text-sm text-text-secondary mt-1">
                            {project.subject}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
