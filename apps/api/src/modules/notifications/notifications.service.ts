import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service.js';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findForUser(
    organizationId: string,
    userId: string,
  ) {
    const [notifications, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: {
          organizationId,
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          isRead: true,
          readAt: true,
          createdAt: true,
        },
      }),
      this.prisma.notification.count({
        where: {
          organizationId,
          userId,
          isRead: false,
        },
      }),
    ]);

    return {
      notifications,
      unreadCount,
    };
  }

  async markAsRead(
    organizationId: string,
    userId: string,
    notificationId: string,
  ) {
    const result = await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        organizationId,
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    if (result.count === 0) {
      const existing = await this.prisma.notification.findFirst({
        where: {
          id: notificationId,
          organizationId,
          userId,
        },
      });

      if (!existing) {
        throw new NotFoundException('Notification not found');
      }
    }

    return {
      message: 'Notification marked as read',
      notificationId,
    };
  }
}