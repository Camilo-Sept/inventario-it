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

type ConsumableCatalogSeedItem = {
  code: string;
  name: string;
  initialStock: number;
  info: string | null;
  photoPath: string | null;
  minimumStock: number;
  maximumStock: number | null;
  unit: string;
  isActive: boolean;
};

function normalizeText(value?: string | null): string | null {
  if (value === undefined || value === null) return null;

  const normalized = value.trim().replace(/\s+/g, ' ').toUpperCase();
  return normalized.length ? normalized : null;
}

function normalizePath(value?: string | null): string | null {
  if (value === undefined || value === null) return null;

  const normalized = value.trim().replace(/\s+/g, ' ');
  return normalized.length ? normalized : null;
}

const items: ConsumableCatalogSeedItem[] = [
  {
    code: 'HP CF217-A CARTUCHO CON CHIP',
    name: 'HP CF217-A CARTUCHO CON CHIP',
    initialStock: 2,
    info: 'toner para impresora de la Lic y de Luis Perez',
    photoPath:
      'Consumibles_Images/HP CF217-A CARTUCHO CON CHIP.FOTO_ART.164124.jpg',
    minimumStock: 1,
    maximumStock: 3,
    unit: 'PIEZA',
    isActive: true,
  },
  {
    code: 'CE285/CB435 COMP-AI TONER',
    name: 'CE285/CB435 COMP-AI TONER',
    initialStock: 3,
    info: 'toner para impresora de IND 1',
    photoPath:
      'Consumibles_Images/CE285-CB435 COMP-AI TONER.FOTO_ART.164951.png',
    minimumStock: 0,
    maximumStock: 1,
    unit: 'PIEZA',
    isActive: true,
  },
  {
    code: 'CE255XCOMP-AI TONER',
    name: 'CE255XCOMP-AI TONER',
    initialStock: 2,
    info: 'toner para impresoras HP 521 Laser Jet',
    photoPath:
      'Consumibles_Images/CE255XCOMP-AI TONER.FOTO_ART.165120.jpg',
    minimumStock: 2,
    maximumStock: 5,
    unit: 'PIEZA',
    isActive: true,
  },
  {
    code: 'TN880COMP-AI TONER',
    name: 'TN880COMP-AI TONER',
    initialStock: 2,
    info: 'toner para impresora Brother',
    photoPath:
      'Consumibles_Images/TN880COMP-AI TONER.FOTO_ART.165133.jpg',
    minimumStock: 1,
    maximumStock: 5,
    unit: 'PIEZA',
    isActive: true,
  },
  {
    code: 'ETIQUETA ZEBRA BLANCA ROLLO 1000 pz',
    name: 'ETIQUETA ZEBRA BLANCA ROLLO 1000 pz',
    initialStock: 100,
    info: 'etiqueta 4"X6" para imopresora zebra ZT410',
    photoPath:
      'Consumibles_Images/ETIQUETA ZEBRA BLANCA ROLLO 1000 pz.FOTO_ART.165329.jpg',
    minimumStock: 10,
    maximumStock: 120,
    unit: 'PIEZA',
    isActive: true,
  },
  {
    code: 'RIBBON PARA ZEBRA NEGRO',
    name: 'RIBBON PARA ZEBRA NEGRO',
    initialStock: 92,
    info: 'RIBBON de color negro rinde para 2000 etiquetas',
    photoPath:
      'Consumibles_Images/RIBBON PARA ZEBRA NEGRO.FOTO_ART.165352.jpg',
    minimumStock: 5,
    maximumStock: 120,
    unit: 'PIEZA',
    isActive: true,
  },
  {
    code: 'ETIQUETA ZEBRA AMARILLA ROLLO 1000 pz',
    name: 'ETIQUETA ZEBRA AMARILLA ROLLO 1000 pz',
    initialStock: 0,
    info: 'etiqueta 4"X6" para imopresora zebra ZT410 para honeywell',
    photoPath:
      'Consumibles_Images/ETIQUETA ZEBRA AMARILLA ROLLO 1000 pz.FOTO_ART.165426.jpg',
    minimumStock: 5,
    maximumStock: 50,
    unit: 'PIEZA',
    isActive: true,
  },
  {
    code: 'ETIQUETA ZEBRA AZUL ROLLO 1000 pz',
    name: 'ETIQUETA ZEBRA AZUL ROLLO 1000 pz',
    initialStock: 0,
    info: 'etiqueta 4"X6" para imopresora zebra ZT410 para honeywell',
    photoPath:
      'Consumibles_Images/ETIQUETA ZEBRA AZUL ROLLO 1000 pz.FOTO_ART.165441.jpg',
    minimumStock: 5,
    maximumStock: 50,
    unit: 'PIEZA',
    isActive: true,
  },
  {
    code: 'ETIQUETA ZEBRA NARANJA ROLLO 1000 pz',
    name: 'ETIQUETA ZEBRA NARANJA ROLLO 1000 pz',
    initialStock: 0,
    info: 'etiqueta 4"X6" para imopresora zebra ZT410 para honeywell',
    photoPath:
      'Consumibles_Images/ETIQUETA ZEBRA NARANJA ROLLO 1000 pz.FOTO_ART.165454.jpg',
    minimumStock: 5,
    maximumStock: 50,
    unit: 'PIEZA',
    isActive: true,
  },
  {
    code: 'c60aa52e',
    name: 'Toner Xerox HONEYWELL',
    initialStock: 1,
    info: null,
    photoPath: 'Consumibles_Images/Toner Xerox HONEYWELL.FOTO_ART.184933.jpg',
    minimumStock: 0,
    maximumStock: 2,
    unit: 'PIEZA',
    isActive: true,
  },
];

async function main() {
  let created = 0;
  let updated = 0;

  for (const item of items) {
    const code = normalizeText(item.code);
    const name = normalizeText(item.name);
    const info = normalizeText(item.info);
    const photoPath = normalizePath(item.photoPath);
    const unit = normalizeText(item.unit);

    if (!code || !name || !unit) {
      throw new Error(`Consumible inválido en seed: ${JSON.stringify(item)}`);
    }

    const existingByCode = await prisma.consumableItem.findUnique({
      where: { code },
    });

    if (existingByCode) {
      await prisma.consumableItem.update({
        where: { code },
        data: {
          name,
          info,
          photoPath,
          unit,
          initialStock: item.initialStock,
          currentStock: item.initialStock,
          minimumStock: item.minimumStock,
          maximumStock: item.maximumStock,
          isActive: item.isActive,
        },
      });

      updated++;
      continue;
    }

    const existingByName = await prisma.consumableItem.findUnique({
      where: { name },
    });

    if (existingByName) {
      await prisma.consumableItem.update({
        where: { id: existingByName.id },
        data: {
          code,
          name,
          info,
          photoPath,
          unit,
          initialStock: item.initialStock,
          currentStock: item.initialStock,
          minimumStock: item.minimumStock,
          maximumStock: item.maximumStock,
          isActive: item.isActive,
        },
      });

      updated++;
      continue;
    }

    await prisma.consumableItem.create({
      data: {
        code,
        name,
        info,
        photoPath,
        unit,
        initialStock: item.initialStock,
        currentStock: item.initialStock,
        minimumStock: item.minimumStock,
        maximumStock: item.maximumStock,
        isActive: item.isActive,
      },
    });

    created++;
  }

  console.log('Seed OK: catálogo de consumibles creado/actualizado');
  console.log({
    total: items.length,
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