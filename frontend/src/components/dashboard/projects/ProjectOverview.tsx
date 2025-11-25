import type { ProjectWithRelations } from '@sumbi/shared-types';
import { Avatar } from '@/components/ui/Avatar';

interface ProjectOverviewProps {
  project: ProjectWithRelations;
}

export default function ProjectOverview({ project }: ProjectOverviewProps) {

  return (
    <div className="bg-background-elevated rounded-lg border border-border p-6 mb-6">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Project Overview</h2>

      {/* Description */}
      <p className="text-text-primary mb-6 leading-relaxed">
        {project.description || 'No description provided.'}
      </p>

      {/* Participants */}
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
  );
}
