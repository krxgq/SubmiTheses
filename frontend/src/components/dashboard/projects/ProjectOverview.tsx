import type { ProjectWithRelations } from '@sumbi/shared-types';
import { Avatar } from '@/components/ui/Avatar';
import { FileText, Target, ListChecks, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ProjectOverviewProps {
  project: ProjectWithRelations;
}

export default function ProjectOverview({ project }: ProjectOverviewProps) {
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
                <h2 className="text-xl font-semibold text-text-primary">Topic</h2>
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
                <h2 className="text-xl font-semibold text-text-primary">Project Goal</h2>
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
                <h2 className="text-xl font-semibold text-text-primary">Specification</h2>
              </div>
              <div className="text-text-primary leading-relaxed prose prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {description.specification}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {description.needed_output && description.needed_output.length > 0 && (
            <div className="bg-background-elevated rounded-lg border border-border p-6">
              <div className="flex items-center gap-2 mb-3">
                <ListChecks className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-text-primary">Needed Output</h2>
              </div>
              <ul className="list-disc list-inside space-y-2">
                {description.needed_output.map((output, index) => (
                  <li key={index} className="text-text-primary">
                    {output}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {description.schedule && Array.isArray(description.schedule) && description.schedule.length > 0 && (
            <div className="bg-background-elevated rounded-lg border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-text-primary">Schedule</h2>
              </div>
              <div className="space-y-3">
                {description.schedule.map((item: any, index: number) => (
                  <div key={index} className="border-l-2 border-primary pl-4 py-2">
                    <div className="font-medium text-text-primary">{item.phase || item.title}</div>
                    {item.description && (
                      <div className="text-sm text-text-secondary mt-1">{item.description}</div>
                    )}
                    {item.deadline && (
                      <div className="text-xs text-text-tertiary mt-1">
                        Deadline: {new Date(item.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Fallback if no description */}
      {!description && (
        <div className="bg-background-elevated rounded-lg border border-border p-6">
          <p className="text-text-secondary text-center">No project description available.</p>
        </div>
      )}

      {/* Participants */}
      <div className="bg-background-elevated rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Team</h2>
        <div className="space-y-4">
          {/* Supervisor */}
          {project.supervisor && (
            <div className="flex items-center gap-3">
              <Avatar src={project.supervisor.avatar_url} name={project.supervisor.full_name} />
              <div>
                <div className="text-sm font-medium text-text-primary">
                  {project.supervisor.full_name || project.supervisor.email}
                </div>
                <div className="text-xs text-text-secondary">Supervisor</div>
              </div>
            </div>
          )}

          {/* Opponent */}
          {project.opponent && (
            <div className="flex items-center gap-3">
              <Avatar src={project.opponent.avatar_url} name={project.opponent.full_name} />
              <div>
                <div className="text-sm font-medium text-text-primary">
                  {project.opponent.full_name || project.opponent.email}
                </div>
                <div className="text-xs text-text-secondary">Opponent</div>
              </div>
            </div>
          )}

          {/* Student */}
          {project.student && (
            <div className="flex items-center gap-3">
              <Avatar src={project.student.avatar_url} name={project.student.full_name} />
              <div>
                <div className="text-sm font-medium text-text-primary">
                  {project.student.full_name || project.student.email}
                </div>
                <div className="text-xs text-text-secondary">Student</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
