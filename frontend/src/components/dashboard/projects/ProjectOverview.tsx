import type {
  ProjectWithRelations,
  ProjectScheduleEntry,
} from "@sumbi/shared-types";
import { formatUserName } from "@/lib/formatters";
import { Avatar } from "@/components/ui/Avatar";
import { FileText, Target, ListChecks, Calendar } from "lucide-react";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { getTranslations } from "next-intl/server";

interface ProjectOverviewProps {
  project: ProjectWithRelations;
}

export default async function ProjectOverview({
  project,
}: ProjectOverviewProps) {
  const t = await getTranslations("projectDetail");
  const tProjects = await getTranslations("projects");
  const description = project.project_description;

  return (
    <div className="space-y-6">
      {/* Topic & Goal */}
      {description && (
        <>
          {description.topic && (
            <div className="bg-background-elevated rounded-lg border border-border p-6">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-text-primary">
                  {t("topic")}
                </h2>
              </div>
              <p className="text-text-primary leading-relaxed">
                {description.topic}
              </p>
            </div>
          )}

          {description.project_goal && (
            <div className="bg-background-elevated rounded-lg border border-border p-6">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-text-primary">
                  {t("projectGoal")}
                </h2>
              </div>
              <p className="text-text-primary leading-relaxed">
                {description.project_goal}
              </p>
            </div>
          )}

          {description.specification && (
            <div className="bg-background-elevated rounded-lg border border-border p-6">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-text-primary">
                  {t("specification")}
                </h2>
              </div>
              <MarkdownRenderer
                content={description.specification}
                className="text-text-primary leading-relaxed"
              />
            </div>
          )}

          {description.needed_output &&
            description.needed_output.length > 0 && (
              <div className="bg-background-elevated rounded-lg border border-border p-6">
                <div className="flex items-center gap-2 mb-3">
                  <ListChecks className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-text-primary">
                    {t("neededOutput")}
                  </h2>
                </div>
                <ul className="list-disc list-inside space-y-2">
                  {description.needed_output.map(
                    (output: string, index: number) => (
                      <li key={index} className="text-text-primary">
                        {output}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}

          {description.schedule &&
            Array.isArray(description.schedule) &&
            description.schedule.length > 0 && (
              <div className="bg-background-elevated rounded-lg border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-text-primary">
                    {t("schedule")}
                  </h2>
                </div>
                <div className="space-y-3">
                  {description.schedule.map(
                    (item: ProjectScheduleEntry, index: number) => (
                      <div
                        key={index}
                        className={`border-l-2 ${item.completed ? "border-status-success" : "border-primary"} pl-4 py-2`}
                      >
                        {/* Task name with completed styling */}
                        <div className="flex items-center gap-2">
                          <div
                            className={`font-medium ${item.completed ? "text-text-secondary line-through" : "text-text-primary"}`}
                          >
                            {item.task}
                          </div>
                          {item.completed && (
                            <span className="text-xs text-status-success">
                              ✓
                            </span>
                          )}
                        </div>
                        {/* Date display */}
                        <div className="text-xs text-text-tertiary mt-1">
                          {item.date}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
        </>
      )}

      {/* Fallback if no description */}
      {!description && (
        <div className="bg-background-elevated rounded-lg border border-border p-6">
          <p className="text-text-secondary text-center">
            {t("noDescription")}
          </p>
        </div>
      )}

      {/* Participants */}
      <div className="bg-background-elevated rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          {t("team")}
        </h2>
        <div className="space-y-4">
          {/* Supervisor */}
          {project.supervisor && (
            <div className="flex items-center gap-3">
              <Avatar
                src={project.supervisor.avatar_url}
                name={formatUserName(
                  project.supervisor.first_name,
                  project.supervisor.last_name,
                )}
              />
              <div>
                <div className="text-sm font-medium text-text-primary">
                  {formatUserName(
                    project.supervisor.first_name,
                    project.supervisor.last_name,
                  ) || project.supervisor.email}
                </div>
                <div className="text-xs text-text-secondary">
                  {tProjects("supervisor")}
                </div>
              </div>
            </div>
          )}

          {/* Opponent */}
          {project.opponent && (
            <div className="flex items-center gap-3">
              <Avatar
                src={project.opponent.avatar_url}
                name={formatUserName(
                  project.opponent.first_name,
                  project.opponent.last_name,
                )}
              />
              <div>
                <div className="text-sm font-medium text-text-primary">
                  {formatUserName(
                    project.opponent.first_name,
                    project.opponent.last_name,
                  ) || project.opponent.email}
                </div>
                <div className="text-xs text-text-secondary">
                  {tProjects("opponent")}
                </div>
              </div>
            </div>
          )}

          {/* Student */}
          {project.student && (
            <div className="flex items-center gap-3">
              <Avatar
                src={project.student.avatar_url}
                name={formatUserName(
                  project.student.first_name,
                  project.student.last_name,
                )}
              />
              <div>
                <div className="text-sm font-medium text-text-primary">
                  {formatUserName(
                    project.student.first_name,
                    project.student.last_name,
                  ) || project.student.email}
                </div>
                <div className="text-xs text-text-secondary">
                  {tProjects("student")}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
