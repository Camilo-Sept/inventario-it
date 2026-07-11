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

const deviceTypes = [
  'ACCESORIO ESCANER ZEBRA',
  'ACCESS POINT',
  'BASE CARGADOR ESCANER',
  'BIOMETRICO',
  'PERIFERICOS PC',
  'CAMARAS',
  'CARGADOR DE CELULAR',
  'CARGADOR DE LAPTOP',
  'CELULAR',
  'CONTROL DE ALARMA',
  'COMPUTADORA',
  'DISCO DURO',
  'DVR',
  'ESCANER USB',
  'ESCANER ZEBRA',
  'EQUIPO REDES',
  'HOTSPOT O PUNTO DE ACCESO MOVIL',
  'IMPRESORA',
  'IP PHONE',
  'MONITOR',
  'PROYECTOR',
  'TABLET',
  'TV',
];

function toCode(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
    .toUpperCase();
}

async function main() {
  for (const name of deviceTypes) {
    const code = toCode(name);

    await prisma.deviceType.upsert({
      where: { code },
      update: {
        name,
        isActive: true,
      },
      create: {
        code,
        name,
        isActive: true,
      },
    });
  }

  console.log(
    `Seed OK: ${deviceTypes.length} tipos de equipo cargados/actualizados`,
  );
}

main()
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });