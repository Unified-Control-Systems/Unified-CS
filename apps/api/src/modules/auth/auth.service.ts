import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';

import { PrismaService } from '../../common/database/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { LogoutDto } from './dto/logout.dto.js';

const REFRESH_TOKEN_TTL_DAYS = 7;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findFirst({
      where: {
        email,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is not active');
    }

    const accessToken = await this.createAccessToken(
      user.id,
      user.organizationId,
    );

    const refreshToken = this.createRefreshToken();
    const refreshTokenHash = this.hashRefreshToken(refreshToken);
    const refreshTokenExpiresAt = this.getRefreshTokenExpiry();

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLoginAt: new Date(),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationId: user.organizationId,
        status: user.status,
      },
    };
  }

  async refresh(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    const refreshTokenHash = this.hashRefreshToken(refreshToken);
    const now = new Date();

    const session = await this.prisma.session.findFirst({
      where: {
        refreshTokenHash,
        revokedAt: null,
        expiresAt: {
          gt: now,
        },
      },
      include: {
        user: true,
      },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = session.user;

    if (!user.isActive || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is not active');
    }

    const newRefreshToken = this.createRefreshToken();
    const newRefreshTokenHash =
      this.hashRefreshToken(newRefreshToken);
    const newRefreshTokenExpiresAt = this.getRefreshTokenExpiry();

    const accessToken = await this.createAccessToken(
      user.id,
      user.organizationId,
    );

    await this.prisma.$transaction(async (tx) => {
      const revoked = await tx.session.updateMany({
        where: {
          id: session.id,
          revokedAt: null,
        },
        data: {
          revokedAt: now,
        },
      });

      if (revoked.count !== 1) {
        throw new UnauthorizedException(
          'Refresh token has already been used',
        );
      }

      await tx.session.create({
        data: {
          userId: user.id,
          refreshTokenHash: newRefreshTokenHash,
          expiresAt: newRefreshTokenExpiresAt,
        },
      });
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(logoutDto: LogoutDto) {
  const refreshTokenHash = this.hashRefreshToken(
    logoutDto.refreshToken,
  );

  const result = await this.prisma.session.updateMany({
    where: {
      refreshTokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  if (result.count === 0) {
    throw new UnauthorizedException(
      'Invalid or already revoked refresh token',
    );
  }

  return {
    message: 'Logout successful',
  };
}

  private async createAccessToken(
    userId: string,
    organizationId: string,
  ) {
    const payload = {
      sub: userId,
      organizationId,
    };

    return this.jwtService.signAsync(payload);
  }

  private createRefreshToken() {
    return randomBytes(64).toString('hex');
  }

  private hashRefreshToken(refreshToken: string) {
    return createHash('sha256')
      .update(refreshToken)
      .digest('hex');
  }

  private getRefreshTokenExpiry() {
    return new Date(
      Date.now() +
        REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    );
  }
}