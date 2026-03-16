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