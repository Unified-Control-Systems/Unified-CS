import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  AuthenticatedUser,
  JwtAuthGuard,
} from './jwt-auth.guard.js';

describe('JwtAuthGuard', () => {
  const jwtService = {
    verifyAsync: vi.fn(),
  };

  const guard = new JwtAuthGuard(
    jwtService as never,
  );

  const createContext = (authorization?: string) => {
    const request: {
      headers: {
        authorization?: string;
      };
      user?: AuthenticatedUser;
    } = {
      headers: {},
    };

    if (authorization) {
      request.headers.authorization = authorization;
    }

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      request,
    };
  };

  it('should reject a request without a token', async () => {
    const context = createContext();

    await expect(
      guard.canActivate(context as never),
    ).rejects.toThrow(
      'Authentication token is required',
    );
  });

  it('should reject an invalid token', async () => {
    jwtService.verifyAsync.mockRejectedValue(
      new Error('invalid token'),
    );

    const context = createContext(
      'Bearer invalid-token',
    );

    await expect(
      guard.canActivate(context as never),
    ).rejects.toThrow(
      'Invalid or expired authentication token',
    );
  });

  it('should accept a valid token', async () => {
    const payload: AuthenticatedUser = {
      sub: 'user-1',
      organizationId: 'org-1',
    };

    jwtService.verifyAsync.mockResolvedValue(payload);

    const context = createContext(
      'Bearer valid-token',
    );

    const result = await guard.canActivate(
      context as never,
    );

    expect(result).toBe(true);
    expect(context.request.user).toEqual(payload);

    expect(
      jwtService.verifyAsync,
    ).toHaveBeenCalledWith(
      'valid-token',
    );
  });

  it('should reject a malformed authorization header', async () => {
    const context = createContext(
      'Basic invalid-token',
    );

    await expect(
      guard.canActivate(context as never),
    ).rejects.toThrow(
      'Authentication token is required',
    );
  });
});