import type { AuthenticatedUser } from '../modules/auth/guards/jwt-auth.guard.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};