import React from 'react';

// Professional Card component for consistent layouts
// Provides clean, bordered containers with subtle shadows
// Variants: default (static), interactive (hover effects), accent (colored top border)

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'accent';
  accentColor?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      accentColor = 'primary',
      padding = 'md',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // Base card styles - professional, clean container
    const baseStyles =
      'bg-background-elevated border border-border rounded-xl transition-all duration-200';

    // Variant styles
    const variantStyles = {
      default: 'shadow-sm',
      interactive:
        'shadow-sm hover:shadow-md hover:border-border-strong cursor-pointer',
      accent: 'shadow-sm border-t-4',
    };

    // Accent border color for accent variant
    const accentBorderColors = {
      primary: 'border-t-primary',
      accent: 'border-t-accent',
      success: 'border-t-success',
      warning: 'border-t-warning',
      danger: 'border-t-danger',
    };

    // Padding styles - responsive for mobile devices
    const paddingStyles = {
      none: '',
      sm: 'p-3 sm:p-4',
      md: 'p-3 sm:p-6',
      lg: 'p-4 sm:p-8',
    };

    const cardClasses = `${baseStyles} ${variantStyles[variant]} ${
      variant === 'accent' ? accentBorderColors[accentColor] : ''
    } ${paddingStyles[padding]} ${className}`;

    return (
      <div ref={ref} className={cardClasses} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header - for consistent card titles
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, description, action, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 mb-4 ${className}`}
        {...props}
      >
        <div className="flex-1">
          {title && (
            <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-text-secondary">{description}</p>
          )}
          {children}
        </div>
        {action && <div className="ml-4 flex-shrink-0">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Footer - for consistent card actions
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  divider?: boolean;
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ divider = true, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`mt-6 ${
          divider ? 'pt-4 border-t border-border' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';
