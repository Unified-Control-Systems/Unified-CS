import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../../common/database/prisma.service.js';

interface DashboardUser {
  userId: string;
  organizationId: string;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(authenticatedUser: DashboardUser) {
    const { userId, organizationId } = authenticatedUser;

    // Revalidate the user and organization.
    // This also prevents suspended users from using an old access token.
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        organizationId,
        isActive: true,
        status: 'ACTIVE',
        organization: {
          isActive: true,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'User or organization is inactive or unavailable',
      );
    }

    // Every organization-owned query is scoped by organizationId.
    const [
      totalUsers,
      activeUsers,
      invitedUsers,
      suspendedUsers,
      totalBranches,
      activeBranches,
      totalDepartments,
      activeDepartments,
      totalRoles,
      recentActivity,
      unreadNotifications,
    ] = await Promise.all([
      this.prisma.user.count({
        where: { organizationId },
      }),

      this.prisma.user.count({
        where: {
          organizationId,
          status: 'ACTIVE',
          isActive: true,
        },
      }),

      this.prisma.user.count({
        where: {
          organizationId,
          status: 'INVITED',
        },
      }),

      this.prisma.user.count({
        where: {
          organizationId,
          status: 'SUSPENDED',
        },
      }),

      this.prisma.branch.count({
        where: { organizationId },
      }),

      this.prisma.branch.count({
        where: {
          organizationId,
          isActive: true,
        },
      }),

      this.prisma.department.count({
        where: { organizationId },
      }),

      this.prisma.department.count({
        where: {
          organizationId,
          isActive: true,
        },
      }),

      this.prisma.role.count({
        where: { organizationId },
      }),

      this.prisma.auditLog.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true,
          action: true,
          entity: true,
          entityId: true,
          metadata: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
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
      organization: user.organization,

      currentUser: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },

      metrics: {
        users: {
          total: totalUsers,
          active: activeUsers,
          invited: invitedUsers,
          suspended: suspendedUsers,
        },

        branches: {
          total: totalBranches,
          active: activeBranches,
        },

        departments: {
          total: totalDepartments,
          active: activeDepartments,
        },

        roles: {
          total: totalRoles,
        },
      },

      recentActivity,

      unreadNotifications,
    };
  }
}