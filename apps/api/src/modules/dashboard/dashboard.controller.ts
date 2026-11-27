import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import {
  AuthenticatedUser,
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard.js';

import { DashboardService } from './dashboard.service.js';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('overview')
  getOverview(@Req() request: AuthenticatedRequest) {
    return this.dashboardService.getOverview({
      userId: request.user.sub,
      organizationId: request.user.organizationId,
    });
  }
}