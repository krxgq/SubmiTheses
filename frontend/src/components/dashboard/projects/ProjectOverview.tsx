import type {
  ProjectWithRelations,
  ProjectScheduleEntry,
} from "@sumbi/shared-types";
import { formatUserName } from "@/lib/formatters";
import { Avatar } from "@/components/ui/Avatar";
import { FileText, Target, ListChecks, Calendar } from "lucide-react";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getTranslations } from "next-intl/server";
import { validateSession } from "@/lib/auth/session-validator";

interface ProjectOverviewProps {
  project: ProjectWithRelations;
}

export default async function ProjectOverview({
  project,
}: ProjectOverviewProps) {
  const t = await getTranslations("projectDetail");
  const tProjects = await getTranslations("projects");
  const description = project.project_description;
  const session = await validateSession();
  const currentUserId = session?.id;

  return (
    <div className="space-y-6">
      {/* Topic & Goal */}
      {description && (
        <>
          {description.topic && (
            <Card variant="accent" accentColor="primary" padding="md">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-text-primary">{t("topic")}</h2>
              </div>
              <p className="text-text-primary leading-relaxed">{description.topic}</p>
            </Card>
          )}

          {description.project_goal && (
            <Card variant="accent" accentColor="accent" padding="md">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-semibold text-text-primary">{t("projectGoal")}</h2>
              </div>
              <p className="text-text-primary leading-relaxed">{description.project_goal}</p>
            </Card>
          )}

          {description.specification && (
            <Card variant="accent" accentColor="primary" padding="md">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-text-primary">{t("specification")}</h2>
              </div>
              <MarkdownRenderer content={description.specification} className="text-text-primary leading-relaxed" />
            </Card>
          )}

          {description.needed_output && description.needed_output.length > 0 && (
            <Card variant="accent" accentColor="success" padding="md">
              <div className="flex items-center gap-2 mb-3">
                <ListChecks className="w-5 h-5 text-success" />
                <h2 className="text-xl font-semibold text-text-primary">{t("neededOutput")}</h2>
              </div>
              <ul className="list-disc list-inside space-y-2">
                {description.needed_output.map((output: string, index: number) => (
                  <li key={index} className="text-text-primary">{output}</li>
                ))}
              </ul>
            </Card>
          )}

          {description.schedule && Array.isArray(description.schedule) && description.schedule.length > 0 && (
            <Card variant="accent" accentColor="warning" padding="md">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-warning" />
                <h2 className="text-xl font-semibold text-text-primary">{t("schedule")}</h2>
              </div>
              <div className="space-y-3">
                {description.schedule.map((item: ProjectScheduleEntry, index: number) => (
                  <div
                    key={index}
                    className={`border-l-2 ${item.completed ? "border-success" : "border-primary"} pl-4 py-2`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`font-medium ${item.completed ? "text-text-secondary line-through" : "text-text-primary"}`}>
                        {item.task}
                      </div>
                      {item.completed && <span className="text-xs text-success">✓</span>}
                    </div>
                    <div className="mt-1">
                      <span className="text-xs font-mono bg-background-secondary text-text-tertiary px-1.5 py-0.5 rounded">
                        {item.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {!description && (
        <Card padding="md">
          <p className="text-text-secondary text-center">{t("noDescription")}</p>
        </Card>
      )}

      {/* Team — grid of member cards, each with avatar + name + role badge */}
      <Card padding="md">
        <h2 className="text-xl font-semibold text-text-primary mb-4">{t("team")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {project.supervisor && (
            <div className="flex flex-col items-center text-center p-4 bg-background-secondary/50 rounded-xl">
              <Avatar size="lg" src={project.supervisor.avatar_url} name={formatUserName(project.supervisor.first_name, project.supervisor.last_name)} />
              <div className="mt-2 text-sm font-medium text-text-primary">
                {formatUserName(project.supervisor.first_name, project.supervisor.last_name) || project.supervisor.email}
              </div>
              <Badge variant={currentUserId === project.supervisor.id ? "accent" : "neutral"} size="sm" className="mt-1.5">{tProjects("supervisor")}</Badge>
            </div>
          )}
          {project.opponent && (
            <div className="flex flex-col items-center text-center p-4 bg-background-secondary/50 rounded-xl">
              <Avatar size="lg" src={project.opponent.avatar_url} name={formatUserName(project.opponent.first_name, project.opponent.last_name)} />
              <div className="mt-2 text-sm font-medium text-text-primary">
                {formatUserName(project.opponent.first_name, project.opponent.last_name) || project.opponent.email}
              </div>
              <Badge variant={currentUserId === project.opponent.id ? "accent" : "neutral"} size="sm" className="mt-1.5">{tProjects("opponent")}</Badge>
            </div>
          )}
          {project.student && (
            <div className="flex flex-col items-center text-center p-4 bg-background-secondary/50 rounded-xl">
              <Avatar size="lg" src={project.student.avatar_url} name={formatUserName(project.student.first_name, project.student.last_name)} />
              <div className="mt-2 text-sm font-medium text-text-primary">
                {formatUserName(project.student.first_name, project.student.last_name) || project.student.email}
              </div>
              <Badge variant={currentUserId === project.student.id ? "accent" : "neutral"} size="sm" className="mt-1.5">{tProjects("student")}</Badge>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
