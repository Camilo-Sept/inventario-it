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

type DepartmentSeedItem = {
  name: string;
  code: string;
  isActive: boolean;
};

const departments: DepartmentSeedItem[] = [
  {
    name: 'ADUANAS',
    code: 'ADUANAS',
    isActive: true,
  },
  {
    name: 'OPERACIONES',
    code: 'OPERACIONES',
    isActive: true,
  },
  {
    name: 'RECURSOS HUMANOS',
    code: 'RECURSOS_HUMANOS',
    isActive: true,
  },
  {
    name: 'ADMINISTRACION',
    code: 'ADMINISTRACION',
    isActive: true,
  },
  {
    name: 'SISTEMAS',
    code: 'SISTEMAS',
    isActive: true,
  },
  {
    name: 'SEGURIDAD',
    code: 'SEGURIDAD',
    isActive: true,
  },
  {
    name: 'MANTENIMIENTO',
    code: 'MANTENIMIENTO',
    isActive: true,
  },
  {
    name: 'CONTABILIDAD Y FINANZAS',
    code: 'CONTABILIDAD_FINANZAS',
    isActive: true,
  },
];

async function main() {
  let created = 0;
  let updated = 0;

  for (const department of departments) {
    const existing = await prisma.department.findUnique({
      where: { code: department.code },
    });

    await prisma.department.upsert({
      where: { code: department.code },
      update: {
        name: department.name,
        isActive: department.isActive,
      },
      create: {
        name: department.name,
        code: department.code,
        isActive: department.isActive,
      },
    });

    if (existing) {
      updated++;
    } else {
      created++;
    }
  }

  console.log('Seed OK: departamentos creados/actualizados');
  console.log({
    total: departments.length,
    created,
    updated,
  });
}

main()
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });