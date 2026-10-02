import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getHealth() {
    let database: 'connected' | 'disconnected' = 'connected';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'disconnected';
    }

    return {
      status: database === 'connected' ? 'ok' : 'degraded',
      service: 'erp-api',
      version: '0.1.0',
      database,
    };
  }
}