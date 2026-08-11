import { PrismaClient } from '../generated/prisma';
import {
  DEFAULT_ROLES,
  PERMISSION_DESCRIPTIONS,
  PERMISSIONS,
} from '../src/common/constants/permissions.constant';

const prisma = new PrismaClient();

async function main() {
  for (const key of Object.values(PERMISSIONS)) {
    await prisma.permission.upsert({
      where: { key },
      update: { description: PERMISSION_DESCRIPTIONS[key] },
      create: { key, description: PERMISSION_DESCRIPTIONS[key] },
    });
  }

  for (const role of Object.values(DEFAULT_ROLES)) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description, isSystem: role.isSystem },
      create: {
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
      },
    });

    const permissions = await prisma.permission.findMany({
      where: { key: { in: role.permissions as string[] } },
    });

    await prisma.rolePermission.deleteMany({
      where: { role: { name: role.name } },
    });

    const roleRecord = await prisma.role.findUniqueOrThrow({
      where: { name: role.name },
    });

    await prisma.rolePermission.createMany({
      data: permissions.map((permission) => ({
        roleId: roleRecord.id,
        permissionId: permission.id,
      })),
      skipDuplicates: true,
    });
  }

  console.log('Seed complete: permissions and default roles (admin, user).');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
