import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { NotificationsService } from './notifications.service.js';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  async findForUser(@Req() request: Request) {
    const user = request.user;

    if (!user) {
      throw new Error('Authenticated user context is missing');
    }

    return this.notificationsService.findForUser(
      user.organizationId,
      user.sub,
    );
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id') notificationId: string,
    @Req() request: Request,
  ) {
    const user = request.user;

    if (!user) {
      throw new Error('Authenticated user context is missing');
    }

    return this.notificationsService.markAsRead(
      user.organizationId,
      user.sub,
      notificationId,
    );
  }
}