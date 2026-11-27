import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { AppService } from './app.service.js';
import { HealthModule } from './modules/health/health.module.js';
import { PrismaModule } from './common/database/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';

@Module({
  imports: [
    HealthModule,
    PrismaModule,
    AuthModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}