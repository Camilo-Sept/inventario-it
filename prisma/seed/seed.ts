import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { execSync } from 'node:child_process';
import { PrismaClient } from '../../src/generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString:
      process.env.DATABASE_URL ??
      'postgresql://ivanorpineda@localhost:5432/inventario_it',
  }),
});

async function seedUsersAndRoles() {
  const isProduction = process.env.NODE_ENV === 'production';
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const adminUsername = process.env.SEED_ADMIN_USERNAME ?? 'admin';
  const adminName = process.env.SEED_ADMIN_NAME ?? 'Administrador General';

  const userEmail = process.env.SEED_USER_EMAIL;
  const userPassword = process.env.SEED_USER_PASSWORD;
  const userUsername = process.env.SEED_USER_USERNAME;
  const userName = process.env.SEED_USER_NAME;

  const adminRole = await prisma.role.upsert({
    where: { code: 'ADMIN' },
    update: {
      name: 'Administrador',
      description: 'Acceso total al sistema',
      isActive: true,
    },
    create: {
      code: 'ADMIN',
      name: 'Administrador',
      description: 'Acceso total al sistema',
      isActive: true,
    },
  });

  const userRole = await prisma.role.upsert({
    where: { code: 'USER' },
    update: {
      name: 'Usuario',
      description: 'Usuario operativo estándar',
      isActive: true,
    },
    create: {
      code: 'USER',
      name: 'Usuario',
      description: 'Usuario operativo estándar',
      isActive: true,
    },
  });

  if (!adminEmail || !adminPassword) {
    if (isProduction) {
      throw new Error(
        'SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD son obligatorios en producción',
      );
    }

    console.log(
      'Seed aviso: no se creó admin porque faltan SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD',
    );
  } else {
    const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        username: adminUsername,
        fullName: adminName,
        passwordHash: adminPasswordHash,
        roleId: adminRole.id,
        status: 'ACTIVE',
        deletedAt: null,
      },
      create: {
        roleId: adminRole.id,
        email: adminEmail,
        username: adminUsername,
        passwordHash: adminPasswordHash,
        fullName: adminName,
        status: 'ACTIVE',
      },
    });
  }

  const standardUserIsConfigured =
    Boolean(userEmail) &&
    Boolean(userPassword) &&
    Boolean(userUsername) &&
    Boolean(userName);

  if (standardUserIsConfigured) {
    const userPasswordHash = await bcrypt.hash(userPassword!, 12);

    await prisma.user.upsert({
      where: { email: userEmail! },
      update: {
        username: userUsername!,
        fullName: userName!,
        passwordHash: userPasswordHash,
        roleId: userRole.id,
        status: 'ACTIVE',
        deletedAt: null,
      },
      create: {
        roleId: userRole.id,
        email: userEmail!,
        username: userUsername!,
        passwordHash: userPasswordHash,
        fullName: userName!,
        status: 'ACTIVE',
      },
    });
  } else {
    console.log(
      'Seed aviso: usuario operativo omitido; configura todas las variables SEED_USER_* para crearlo',
    );
  }

  console.log('Seed OK: roles y usuarios configurados creados/actualizados');
}

function runSeed(file: string) {
  console.log(`\n>>> Ejecutando seed: ${file}`);
  execSync(`pnpm exec tsx prisma/seed/${file}`, {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
}

async function main() {
  console.log('\n>>> Ejecutando seed base: users/roles');
  await seedUsersAndRoles();

  runSeed('device-types.seed.ts');
  runSeed('brands.seed.ts');
  runSeed('branches-warehouses.seed.ts');
  runSeed('departments.seed.ts');
  runSeed('app-sequences.seed.ts');
  runSeed('consumable-items.seed.ts');

  console.log('\nSeed maestro completado correctamente');
}

main()
  .catch((error) => {
    console.error('Seed maestro error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
