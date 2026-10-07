import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from './auth.service.js';

vi.mock('bcrypt', () => ({
  compare: vi.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;

  const prisma = {
    user: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    session: {
      create: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  const jwtService = {
    signAsync: vi.fn(),
  };

  const activeUser = {
    id: 'user-1',
    organizationId: 'org-1',
    email: 'admin@unified-cs.local',
    passwordHash: 'hashed-password',
    firstName: 'System',
    lastName: 'Administrator',
    status: 'ACTIVE',
    isActive: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    authService = new AuthService(
      prisma as never,
      jwtService as never,
    );
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue(activeUser);

    //   vi.mocked(bcrypt.compare).mockResolvedValue(true);
    vi.mocked(bcrypt.compare).mockImplementation(
        async () => true,
    );

      prisma.user.update.mockResolvedValue(activeUser);

      prisma.session.create.mockResolvedValue({
        id: 'session-1',
      });

      jwtService.signAsync.mockResolvedValue(
        'access-token',
      );

      const result = await authService.login({
        email: 'admin@unified-cs.local',
        password: 'Admin@12345',
      });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBeDefined();

      expect(result.user).toEqual({
        id: activeUser.id,
        email: activeUser.email,
        firstName: activeUser.firstName,
        lastName: activeUser.lastName,
        organizationId: activeUser.organizationId,
        status: activeUser.status,
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'Admin@12345',
        'hashed-password',
      );

      expect(prisma.session.create).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should reject an unknown user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'unknown@example.com',
          password: 'Password123',
        }),
      ).rejects.toThrow('Invalid email or password');

      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should reject an incorrect password', async () => {
      prisma.user.findFirst.mockResolvedValue(activeUser);

      vi.mocked(bcrypt.compare).mockImplementation(
        async () => false,
    );

      await expect(
        authService.login({
          email: activeUser.email,
          password: 'wrong-password',
        }),
      ).rejects.toThrow('Invalid email or password');

      expect(prisma.session.create).not.toHaveBeenCalled();
    });

    it('should reject an inactive user', async () => {
      prisma.user.findFirst.mockResolvedValue({
        ...activeUser,
        isActive: true,
        status: 'SUSPENDED',
      });

    //   vi.mocked(bcrypt.compare).mockResolvedValue(true);
    vi.mocked(bcrypt.compare).mockImplementation(
        async () => true,
    );

      await expect(
        authService.login({
          email: activeUser.email,
          password: 'Admin@12345',
        }),
      ).rejects.toThrow('User account is not active');

      expect(prisma.session.create).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should rotate a valid refresh token', async () => {
      prisma.session.findFirst.mockResolvedValue({
        id: 'session-old',
        userId: activeUser.id,
        refreshTokenHash: 'old-hash',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
        user: activeUser,
      });

      prisma.session.updateMany.mockResolvedValue({
        count: 1,
      });

      prisma.session.create.mockResolvedValue({
        id: 'session-new',
      });

      prisma.$transaction.mockImplementation(
        async (callback) => callback(prisma),
      );

      jwtService.signAsync.mockResolvedValue(
        'new-access-token',
      );

      const result = await authService.refresh({
        refreshToken: 'a'.repeat(128),
      });

      expect(result.accessToken).toBe(
        'new-access-token',
      );

      expect(result.refreshToken).toBeDefined();

      expect(prisma.session.updateMany).toHaveBeenCalled();
      expect(prisma.session.create).toHaveBeenCalled();
    });

    it('should reject an invalid refresh token', async () => {
      prisma.session.findFirst.mockResolvedValue(null);

      await expect(
        authService.refresh({
          refreshToken: 'a'.repeat(128),
        }),
      ).rejects.toThrow(
        'Invalid or expired refresh token',
      );
    });

    it('should reject a revoked refresh token', async () => {
      prisma.session.findFirst.mockResolvedValue(null);

      await expect(
        authService.refresh({
          refreshToken: 'a'.repeat(128),
        }),
      ).rejects.toThrow(
        'Invalid or expired refresh token',
      );
    });

    it('should reject refresh when the session was already rotated', async () => {
      prisma.session.findFirst.mockResolvedValue({
        id: 'session-old',
        userId: activeUser.id,
        refreshTokenHash: 'old-hash',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
        user: activeUser,
      });

      prisma.session.updateMany.mockResolvedValue({
        count: 0,
      });

      prisma.$transaction.mockImplementation(
        async (callback) => callback(prisma),
      );

      jwtService.signAsync.mockResolvedValue(
        'new-access-token',
      );

      await expect(
        authService.refresh({
          refreshToken: 'a'.repeat(128),
        }),
      ).rejects.toThrow(
        'Refresh token has already been used',
      );
    });
  });

  describe('logout', () => {
    it('should revoke an active session', async () => {
      prisma.session.updateMany.mockResolvedValue({
        count: 1,
      });

      const result = await authService.logout({
        refreshToken: 'a'.repeat(128),
      });

      expect(result).toEqual({
        message: 'Logout successful',
      });

      expect(
        prisma.session.updateMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            revokedAt: null,
          }),
          data: expect.objectContaining({
            revokedAt: expect.any(Date),
          }),
        }),
      );
    });

    it('should reject an already revoked session', async () => {
      prisma.session.updateMany.mockResolvedValue({
        count: 0,
      });

      await expect(
        authService.logout({
          refreshToken: 'a'.repeat(128),
        }),
      ).rejects.toThrow(
        'Invalid or already revoked refresh token',
      );
    });
  });
});