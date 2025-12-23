/**
 * Utility functions for formatting data
 */

/**
 * Format a user's full name from first and last names
 * @param first_name - User's first name
 * @param last_name - User's last name
 * @param format - Format type: 'full' (First Last), 'reverse' (Last, First), or 'first' (First only)
 * @returns Formatted name string
 */
export function formatUserName(
  first_name?: string | null,
  last_name?: string | null,
  format: 'full' | 'reverse' | 'first' = 'full'
): string {
  const firstName = first_name?.trim() || '';
  const lastName = last_name?.trim() || '';

  if (!firstName && !lastName) {
    return 'Unknown User';
  }

  switch (format) {
    case 'full':
      return [firstName, lastName].filter(Boolean).join(' ');
    case 'reverse':
      return lastName && firstName
        ? `${lastName}, ${firstName}`
        : firstName || lastName;
    case 'first':
      return firstName || lastName;
    default:
      return [firstName, lastName].filter(Boolean).join(' ');
  }
}

/**
 * Get initials from user's name
 * @param first_name - User's first name
 * @param last_name - User's last name
 * @returns Initials (e.g., "JD" for John Doe)
 */
export function getUserInitials(
  first_name?: string | null,
  last_name?: string | null
): string {
  const firstName = first_name?.trim() || '';
  const lastName = last_name?.trim() || '';

  if (!firstName && !lastName) {
    return '?';
  }

  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();

  return (firstInitial + lastInitial) || firstInitial || lastInitial;
}
