import 'dotenv/config';
import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString:
      process.env.DATABASE_URL ??
      'postgresql://ivanorpineda@localhost:5432/inventario_it',
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
    'ALMACEN IT',
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
      const warehouseCode =
        warehouseName === 'ALMACEN IT'
          ? 'ALMACEN_IT'
          : `${branchData.code}_${toCode(warehouseName)}`;

      const existingWarehouse = await prisma.warehouse.findFirst({
        where: {
          branchId: branch.id,
          name: warehouseName,
        },
      });

      if (existingWarehouse) {
        await prisma.warehouse.update({
          where: { id: existingWarehouse.id },
          data: {
            code: warehouseCode,
            isActive: true,
          },
        });
      } else {
        await prisma.warehouse.create({
          data: {
            branchId: branch.id,
            code: warehouseCode,
            name: warehouseName,
            isActive: true,
          },
        });
      }
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
