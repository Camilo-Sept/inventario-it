import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { execSync } from 'node:child_process';
import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3307),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'inventario_it',
  }),
});

async function seedUsersAndRoles() {
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

  const adminPasswordHash = await bcrypt.hash('Admin123*', 10);
  const userPasswordHash = await bcrypt.hash('User123*', 10);

  await prisma.user.upsert({
    where: { email: 'admin@impulso.local' },
    update: {
      username: 'admin',
      fullName: 'Administrador General',
      passwordHash: adminPasswordHash,
      roleId: adminRole.id,
      status: 'ACTIVE',
      deletedAt: null,
    },
    create: {
      roleId: adminRole.id,
      email: 'admin@impulso.local',
      username: 'admin',
      passwordHash: adminPasswordHash,
      fullName: 'Administrador General',
      status: 'ACTIVE',
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@impulso.local' },
    update: {
      username: 'usuario1',
      fullName: 'Usuario Operativo',
      passwordHash: userPasswordHash,
      roleId: userRole.id,
      status: 'ACTIVE',
      deletedAt: null,
    },
    create: {
      roleId: userRole.id,
      email: 'user@impulso.local',
      username: 'usuario1',
      passwordHash: userPasswordHash,
      fullName: 'Usuario Operativo',
      status: 'ACTIVE',
    },
  });

  console.log('Seed OK: ADMIN y USER creados/actualizados');
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