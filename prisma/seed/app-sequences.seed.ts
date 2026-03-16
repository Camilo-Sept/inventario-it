import 'dotenv/config';
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

async function main() {
  await prisma.appSequence.upsert({
    where: { code: 'DEVICE' },
    update: {
      prefix: 'IMP',
      isActive: true,
    },
    create: {
      code: 'DEVICE',
      prefix: 'IMP',
      currentValue: 0,
      isActive: true,
    },
  });

  await prisma.appSequence.upsert({
    where: { code: 'CONSUMABLE_MOVEMENT' },
    update: {
      prefix: 'MOV',
      isActive: true,
    },
    create: {
      code: 'CONSUMABLE_MOVEMENT',
      prefix: 'MOV',
      currentValue: 0,
      isActive: true,
    },
  });

  console.log('Seed OK: secuencias DEVICE y CONSUMABLE_MOVEMENT configuradas');
}

main()
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });