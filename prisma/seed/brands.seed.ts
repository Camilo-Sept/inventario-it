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

const brands = [
  'ACER',
  'ACTECK',
  'APPLE',
  'ARUBA HP',
  'ASUS',
  'BENQ',
  'BROTHER',
  'DAHUA',
  'DELL',
  'DELL ALIENWARE',
  'EPSON',
  'GENERICO',
  'GOOGLE',
  'GRANDSTREAM',
  'HEWLETT PACKARD',
  'HIKVISION',
  'HONEYWELL',
  'HUAWEI',
  'KINGSTON',
  'LENOVO',
  'LG',
  'LINKSYS',
  'LOGITECH',
  'MOTOROLA',
  'OSTRICH',
  'PERFECT CHOICE',
  'QUANTUM',
  'RADIOSHACK',
  'RETEMEX',
  'ROKU',
  'SAMSUNG',
  'SEAGATE',
  'SERCOMM',
  'SONY',
  'SPECTRE',
  'SPEEDCHOICE',
  'STEREN',
  'STYLISH',
  'SUSTEK',
  'TECHZONE',
  'VTECH',
  'TOSHIBA',
  'TP-LINK',
  'WD',
  'XEROX',
  'XIAOMI',
  'ZEBRA',
];

async function main() {
  for (const name of brands) {
    await prisma.brand.upsert({
      where: { name },
      update: {
        isActive: true,
      },
      create: {
        name,
        isActive: true,
      },
    });
  }

  console.log(`Seed OK: ${brands.length} marcas cargadas/actualizadas`);
}

main()
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });