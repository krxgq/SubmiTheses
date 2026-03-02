import { Request, Response, NextFunction } from 'express';

/**
 * CSRF protection via custom header check.
 * Browsers prevent cross-origin sites from setting custom headers (blocked by
 * same-origin policy unless CORS explicitly allows it). Requiring
 * X-Requested-With on state-changing requests blocks form-based CSRF attacks.
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Only check state-changing methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const xRequestedWith = req.headers['x-requested-with'];
  if (xRequestedWith !== 'XMLHttpRequest') {
    return res.status(403).json({ error: 'Missing CSRF header' });
  }

  next();
}
