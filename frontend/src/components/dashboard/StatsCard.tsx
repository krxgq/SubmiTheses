import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-primary',
  bgColor = 'bg-background-hover'
}: StatsCardProps) {
  return (
    <div className="bg-background-elevated rounded-xl shadow-sm border border-border p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`${iconColor} w-6 h-6`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-secondary">
            {title}
          </p>
          <p className="text-2xl font-bold text-primary">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
