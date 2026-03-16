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

const branches = [
  { code: 'JUAREZ', name: 'JUAREZ' },
  { code: 'TEXAS', name: 'TEXAS' },
  { code: 'OBREGON', name: 'OBREGON' },
  { code: 'MONTERREY', name: 'MONTERREY' },
  { code: 'REYNOSA', name: 'REYNOSA' },
  { code: 'QUERETARO', name: 'QUERETARO' },
  { code: 'LOVOSICE', name: 'LOVOSICE' },
];

const warehousesByBranch: Record<string, string[]> = {
  JUAREZ: [
    'JRZ 1',
    'JRZ 2',
    'JRZ 3',
    'JRZ 4',
    'JRZ 5',
    'JRZ 6',
    'JRZ 7',
    'JRZ 8',
    'JRZ 9',
    'JRZ 10',
    'JRZ 11',
  ],
  TEXAS: ['EL PASO 1', 'EL PASO 2', 'PHARR'],
  OBREGON: ['OBREGON'],
  MONTERREY: ['MONTERREY'],
  REYNOSA: ['REYNOSA'],
  QUERETARO: ['QUERETARO'],
  LOVOSICE: ['LOVOSICE'],
};

function toCode(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
    .toUpperCase();
}

async function main() {
  for (const branchData of branches) {
    const branch = await prisma.branch.upsert({
      where: { code: branchData.code },
      update: {
        name: branchData.name,
        isActive: true,
      },
      create: {
        code: branchData.code,
        name: branchData.name,
        isActive: true,
      },
    });

    const warehouses = warehousesByBranch[branchData.code] ?? [];

    for (const warehouseName of warehouses) {
      const warehouseCode = `${branchData.code}_${toCode(warehouseName)}`;

      await prisma.warehouse.upsert({
        where: { code: warehouseCode },
        update: {
          name: warehouseName,
          branchId: branch.id,
          isActive: true,
        },
        create: {
          branchId: branch.id,
          code: warehouseCode,
          name: warehouseName,
          isActive: true,
        },
      });
    }
  }

  console.log('Seed OK: branches y warehouses cargados/actualizados');
}

main()
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });