import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../common/database/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

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

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLoginAt: new Date(),
      },
    });

    return {
      message: 'Login successful',
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
}