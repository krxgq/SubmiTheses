interface AvatarProps {
  src?: string | null;
  name?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Generate initials from name
function getInitials(name?: string | null): string {
  if (!name) return 'U';

  const parts = name.trim().split(/\s+/);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  return name.substring(0, 2).toUpperCase();
}

// Generate consistent background color from name using hash
function getColorFromName(name?: string | null): string {
  if (!name) return 'hsl(220, 13%, 69%)';

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate hue (0-360), keep saturation and lightness pleasant
  const hue = Math.abs(hash % 360);
  const saturation = 65;
  const lightness = 55;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function Avatar({
  src,
  name,
  alt,
  size = 'md',
  className,
}: AvatarProps) {
  const sizeMap = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const initials = getInitials(name);
  const backgroundColor = getColorFromName(name);

  return (
    <div
      className={`${sizeMap[size]} rounded-full flex items-center justify-center font-semibold text-white overflow-hidden ${className || ''}`}
      style={{ backgroundColor }}
    >
      {src ? (
        <img src={src} alt={alt || name || 'User avatar'} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
