export function isAccessDeniedError(error: any): boolean {
  return (
    error?.message?.includes('Access denied') ||
    error?.response?.status === 403 ||
    error?.error === 'Access denied'
  );
}

export function isNotFoundError(error: any): boolean {
  return (
    error?.response?.status === 404 ||
    error?.message?.includes('not found') ||
    error?.message?.includes('Not found')
  );
}
