import React from 'react';

// Professional Badge component for status indicators and labels
// Uses soft background colors with matching borders for subtle, clean design
// Variants match the color system: primary, accent, success, warning, danger, neutral

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'neutral',
      size = 'md',
      dot = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // Base badge styles - professional, subtle design
    const baseStyles =
      'inline-flex items-center font-medium border transition-colors duration-200';

    // Variant styles - soft backgrounds with matching borders
    const variantStyles = {
      primary:
        'bg-primary/10 text-primary border-primary/20',
      accent:
        'bg-accent/10 text-accent border-accent/20',
      success:
        'bg-success/10 text-success border-success/20',
      warning:
        'bg-warning/10 text-warning border-warning/20',
      danger:
        'bg-danger/10 text-danger border-danger/20',
      neutral:
        'bg-background-tertiary text-text-secondary border-border',
    };

    // Size styles
    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs rounded-md gap-1',
      md: 'px-2.5 py-0.5 text-sm rounded-md gap-1.5',
      lg: 'px-3 py-1 text-base rounded-lg gap-2',
    };

    // Dot size styles (optional status indicator dot)
    const dotSizeStyles = {
      sm: 'h-1.5 w-1.5',
      md: 'h-2 w-2',
      lg: 'h-2.5 w-2.5',
    };

    const badgeClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

    return (
      <span ref={ref} className={badgeClasses} {...props}>
        {dot && (
          <span
            className={`rounded-full bg-current ${dotSizeStyles[size]}`}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
