import { AuthUser } from './schemas';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}