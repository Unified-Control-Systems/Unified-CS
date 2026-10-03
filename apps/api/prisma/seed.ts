import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured');
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const PERMISSIONS = [
  {
    resource: 'organization',
    action: 'read',
    description: 'View organization information',
  },
  {
    resource: 'organization',
    action: 'update',
    description: 'Update organization information',
  },
  {
    resource: 'users',
    action: 'read',
    description: 'View users',
  },
  {
    resource: 'users',
    action: 'create',
    description: 'Create users',
  },
  {
    resource: 'users',
    action: 'update',
    description: 'Update users',
  },
  {
    resource: 'users',
    action: 'delete',
    description: 'Delete users',
  },
  {
    resource: 'roles',
    action: 'read',
    description: 'View roles',
  },
  {
    resource: 'roles',
    action: 'create',
    description: 'Create roles',
  },
  {
    resource: 'roles',
    action: 'update',
    description: 'Update roles',
  },
  {
    resource: 'roles',
    action: 'delete',
    description: 'Delete roles',
  },
];

const ROLES = [
  {
    name: 'ADMIN',
    description: 'Full administrative access',
  },
  {
    name: 'HR_MANAGER',
    description: 'Human resources management access',
  },
  {
    name: 'INVENTORY_MANAGER',
    description: 'Inventory management access',
  },
  {
    name: 'SALES_MANAGER',
    description: 'Sales management access',
  },
  {
    name: 'ACCOUNTANT',
    description: 'Finance and accounting access',
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  /*
   * ------------------------------------------------------------
   * Organization
   * ------------------------------------------------------------
   */

  const organization = await prisma.organization.upsert({
    where: {
      slug: 'demo-organization',
    },
    update: {
      name: 'Demo Organization',
      description: 'Default development organization for Unified-CS',
      isActive: true,
    },
    create: {
      name: 'Demo Organization',
      slug: 'demo-organization',
      description: 'Default development organization for Unified-CS',
      isActive: true,
    },
  });

  console.log(`✓ Organization: ${organization.name}`);

  /*
   * ------------------------------------------------------------
   * Branch
   * ------------------------------------------------------------
   */

  const branch = await prisma.branch.upsert({
    where: {
      organizationId_code: {
        organizationId: organization.id,
        code: 'HQ',
      },
    },
    update: {
      name: 'Head Office',
      city: 'Bhopal',
      state: 'Madhya Pradesh',
      country: 'India',
      isActive: true,
    },
    create: {
      organizationId: organization.id,
      name: 'Head Office',
      code: 'HQ',
      city: 'Bhopal',
      state: 'Madhya Pradesh',
      country: 'India',
      isActive: true,
    },
  });

  console.log(`✓ Branch: ${branch.name}`);

  /*
   * ------------------------------------------------------------
   * Departments
   * ------------------------------------------------------------
   */

  const departments = [
    {
      name: 'Human Resources',
      code: 'HR',
      description: 'Human resources and employee management',
    },
    {
      name: 'Inventory',
      code: 'INV',
      description: 'Inventory and warehouse management',
    },
    {
      name: 'Sales',
      code: 'SALES',
      description: 'Sales and customer management',
    },
    {
      name: 'Finance',
      code: 'FIN',
      description: 'Finance and accounting',
    },
  ];

  for (const department of departments) {
    await prisma.department.upsert({
      where: {
        organizationId_code: {
          organizationId: organization.id,
          code: department.code,
        },
      },
      update: {
        name: department.name,
        description: department.description,
        branchId: branch.id,
        isActive: true,
      },
      create: {
        organizationId: organization.id,
        branchId: branch.id,
        name: department.name,
        code: department.code,
        description: department.description,
        isActive: true,
      },
    });
  }

  console.log(`✓ Departments: ${departments.length}`);

  /*
   * ------------------------------------------------------------
   * Permissions
   * ------------------------------------------------------------
   */

  const permissions = new Map<string, string>();

  for (const permission of PERMISSIONS) {
    const record = await prisma.permission.upsert({
      where: {
        resource_action: {
          resource: permission.resource,
          action: permission.action,
        },
      },
      update: {
        description: permission.description,
      },
      create: permission,
    });

    permissions.set(
      `${permission.resource}.${permission.action}`,
      record.id,
    );
  }

  console.log(`✓ Permissions: ${PERMISSIONS.length}`);

  /*
   * ------------------------------------------------------------
   * Roles
   * ------------------------------------------------------------
   */

  const roles = new Map<string, string>();

  for (const role of ROLES) {
    const record = await prisma.role.upsert({
      where: {
        organizationId_name: {
          organizationId: organization.id,
          name: role.name,
        },
      },
      update: {
        description: role.description,
        isSystemRole: true,
      },
      create: {
        organizationId: organization.id,
        name: role.name,
        description: role.description,
        isSystemRole: true,
      },
    });

    roles.set(role.name, record.id);
  }

  console.log(`✓ Roles: ${ROLES.length}`);

  /*
   * ------------------------------------------------------------
   * ADMIN permissions
   * ------------------------------------------------------------
   */

  const adminRoleId = roles.get('ADMIN');

  if (!adminRoleId) {
    throw new Error('ADMIN role was not created');
  }

  for (const permissionId of permissions.values()) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRoleId,
          permissionId,
        },
      },
      update: {},
      create: {
        roleId: adminRoleId,
        permissionId,
      },
    });
  }

  console.log('✓ ADMIN permissions assigned');

  /*
   * ------------------------------------------------------------
   * Development Admin User
   * ------------------------------------------------------------
   */

  const passwordHash = await bcrypt.hash('Admin@12345', 12);

  const adminUser = await prisma.user.upsert({
    where: {
      organizationId_email: {
        organizationId: organization.id,
        email: 'admin@unified-cs.local',
      },
    },
    update: {
      firstName: 'System',
      lastName: 'Administrator',
      passwordHash,
      status: 'ACTIVE',
      isActive: true,
      branchId: branch.id,
    },
    create: {
      organizationId: organization.id,
      email: 'admin@unified-cs.local',
      passwordHash,
      firstName: 'System',
      lastName: 'Administrator',
      status: 'ACTIVE',
      isActive: true,
      branchId: branch.id,
    },
  });

  console.log(`✓ Admin user: ${adminUser.email}`);

  /*
   * ------------------------------------------------------------
   * ADMIN role assignment
   * ------------------------------------------------------------
   */

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRoleId,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRoleId,
    },
  });

  console.log('✓ ADMIN role assigned');

  console.log('🌱 Database seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('❌ Database seed failed:');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });