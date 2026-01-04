import React from 'react';
import { LucideIcon } from 'lucide-react';

// Friendly Empty State component for sections with no content
// Shows icon, title, and description with professional styling

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) => {
  return (
    <div
      className={`py-12 px-6 text-center bg-background-secondary/30 rounded-xl ${className}`}
    >
      {Icon && (
        <div className="flex justify-center mb-4">
          <Icon className="text-text-tertiary" size={48} />
        </div>
      )}

      <h3 className="text-lg font-medium text-text-secondary">{title}</h3>

      {description && (
        <p className="mt-1 text-sm text-text-tertiary max-w-md mx-auto">
          {description}
        </p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};
