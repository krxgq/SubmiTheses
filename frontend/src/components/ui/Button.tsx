import React from 'react';

// Professional Button component with academic styling
// Variants: primary (filled navy), secondary (outlined), tertiary (ghost), danger (red filled)
// Sizes: sm, md (default), lg

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rounded?: 'default' | 'full'; // For icon buttons
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      rounded = 'default',
      className = '',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Base button styles - professional, clean design
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

    // Variant styles - different button types with modern hover effects
    const variantStyles = {
      primary:
        'bg-interactive-primary text-text-inverse hover:bg-interactive-primary-hover hover:scale-[1.02] active:scale-[0.98] active:bg-primary-active shadow-sm hover:shadow-md focus:ring-primary',
      secondary:
        'border-2 border-interactive-primary text-interactive-primary bg-transparent hover:bg-primary/5 active:bg-background-active focus:ring-primary',
      tertiary:
        'text-interactive-primary bg-transparent hover:bg-background-hover active:bg-background-active focus:ring-primary',
      danger:
        'bg-danger text-text-inverse hover:bg-danger-hover hover:scale-[1.02] active:scale-[0.98] active:bg-danger shadow-sm hover:shadow-md focus:ring-danger',
      icon:
        'bg-transparent text-text-secondary hover:bg-background-hover hover:text-text-primary active:bg-background-active focus:ring-primary',
    };

    // Size styles - increased padding for md and lg, rounded-xl for modern look
    const sizeStyles = {
      sm: variant === 'icon' ? 'p-2 text-sm' : 'px-4 py-2 text-sm gap-1.5',
      md: variant === 'icon' ? 'p-2.5 text-base' : 'px-6 py-3 text-base gap-2',
      lg: variant === 'icon' ? 'p-3 text-lg' : 'px-8 py-3.5 text-lg gap-2.5',
    };

    // Border radius - rounded-xl for regular buttons, option for rounded-full for icon buttons
    const radiusStyles = variant === 'icon'
      ? (rounded === 'full' ? 'rounded-full' : 'rounded-lg')
      : 'rounded-xl';

    // Width styles
    const widthStyles = fullWidth ? 'w-full' : '';

    // Icon button sizing - square aspect ratio
    const iconButtonStyles = variant === 'icon' ? 'aspect-square' : '';

    const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${radiusStyles} ${widthStyles} ${iconButtonStyles} ${className}`;

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Spinner size={size} />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Loading spinner component - professional rotating animation
const Spinner = ({ size }: { size: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};
