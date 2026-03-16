import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConsumableMovementDto } from './dto/create-consumable-movement.dto';
import ExcelJS from 'exceljs';

type FindAllConsumableMovementsParams = {
  folio?: string;
  movementType?: string;
  warehouseId?: string;
  departmentId?: string;
  employeeName?: string;
  consumableItemId?: string;
  dateFrom?: string;
  dateTo?: string;
};

const movementDetailInclude = {
  warehouse: {
    include: {
      branch: true,
    },
  },
  department: true,
  createdBy: {
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      status: true,
    },
  },
  items: {
    include: {
      consumableItem: true,
    },
  },
} as const;

type ConsumableMovementWithRelations = Prisma.ConsumableMovementGetPayload<{
  include: typeof movementDetailInclude;
}>;

@Injectable()
export class ConsumableMovementsService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeText(value?: string | null): string | null | undefined {
    if (value === undefined) return undefined;
    if (value === null) return null;

    const normalized = value.trim().replace(/\s+/g, ' ').toUpperCase();
    return normalized.length ? normalized : null;
  }

  private normalizePath(value?: string | null): string | null | undefined {
    if (value === undefined) return undefined;
    if (value === null) return null;

    const normalized = value.trim().replace(/\s+/g, ' ');
    return normalized.length ? normalized : null;
  }

  private async getNextMovementFolio(tx: PrismaService): Promise<string> {
    const sequence = await tx.appSequence.findUnique({
      where: { code: 'CONSUMABLE_MOVEMENT' },
    });

    if (!sequence || !sequence.isActive) {
      throw new NotFoundException(
        'La secuencia CONSUMABLE_MOVEMENT no existe o está inactiva',
      );
    }

    const nextValue = sequence.currentValue + 1;

    await tx.appSequence.update({
      where: { code: 'CONSUMABLE_MOVEMENT' },
      data: {
        currentValue: nextValue,
      },
    });

    return `${sequence.prefix}-${String(nextValue).padStart(4, '0')}`;
  }

  private mapMovementResponse(movement: ConsumableMovementWithRelations) {
    return {
      id: movement.id,
      folio: movement.folio,
      movementType: movement.movementType,
      movementDate: movement.movementDate,
      employeeName: movement.employeeName,
      deliveredByName: movement.deliveredByName,
      signaturePath: movement.signaturePath,
      documentPath: movement.documentPath,
      notes: movement.notes,
      createdAt: movement.createdAt,
      updatedAt: movement.updatedAt,

      warehouseId: movement.warehouseId,
      warehouseName: movement.warehouse?.name ?? null,
      warehouseCode: movement.warehouse?.code ?? null,
      branchId: movement.warehouse?.branch.id ?? null,
      branchName: movement.warehouse?.branch.name ?? null,
      branchCode: movement.warehouse?.branch.code ?? null,

      departmentId: movement.departmentId,
      departmentName: movement.department?.name ?? null,
      departmentCode: movement.department?.code ?? null,

      createdByUserId: movement.createdByUserId,
      createdByName: movement.createdBy.fullName,
      createdByUsername: movement.createdBy.username,
      createdByEmail: movement.createdBy.email,

      items: movement.items.map((item) => ({
        id: item.id,
        consumableItemId: item.consumableItemId,
        quantity: Number(item.quantity),
        unit: item.unit,
        itemNameSnapshot: item.itemNameSnapshot,
        itemCodeSnapshot: item.itemCodeSnapshot,
        notes: item.notes,
        createdAt: item.createdAt,

        currentItemCode: item.consumableItem.code,
        currentItemName: item.consumableItem.name,
        currentItemStock: Number(item.consumableItem.currentStock),
      })),
    };
  }

  private buildFindAllWhere(params: FindAllConsumableMovementsParams = {}) {
    const {
      folio,
      movementType,
      warehouseId,
      departmentId,
      employeeName,
      consumableItemId,
      dateFrom,
      dateTo,
    } = params;

    const where: Prisma.ConsumableMovementWhereInput = {};

    if (folio && folio.trim()) {
      where.folio = {
        contains: folio.trim().toUpperCase(),
      };
    }

    if (movementType && movementType.trim()) {
      where.movementType = this.normalizeText(movementType) ?? undefined;
    }

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (employeeName && employeeName.trim()) {
      where.employeeName = {
        contains: employeeName.trim().toUpperCase(),
      };
    }

    if (consumableItemId) {
      where.items = {
        some: {
          consumableItemId,
        },
      };
    }

    if (dateFrom || dateTo) {
      where.movementDate = {};

      if (dateFrom) {
        where.movementDate.gte = new Date(dateFrom);
      }

      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.movementDate.lte = endDate;
      }
    }

    return where;
  }

  async findAll(params: FindAllConsumableMovementsParams = {}) {
    const where = this.buildFindAllWhere(params);

    const movements = await this.prisma.consumableMovement.findMany({
      where,
      include: movementDetailInclude,
      orderBy: [{ movementDate: 'desc' }, { createdAt: 'desc' }],
    });

    return {
      ok: true,
      message: 'Movimientos de consumibles obtenidos correctamente',
      total: movements.length,
      filters: {
        folio: params.folio ?? null,
        movementType: params.movementType ?? null,
        warehouseId: params.warehouseId ?? null,
        departmentId: params.departmentId ?? null,
        employeeName: params.employeeName ?? null,
        consumableItemId: params.consumableItemId ?? null,
        dateFrom: params.dateFrom ?? null,
        dateTo: params.dateTo ?? null,
      },
      data: movements.map((movement) => this.mapMovementResponse(movement)),
    };
  }

  async exportExcel(params: FindAllConsumableMovementsParams = {}) {
    const where = this.buildFindAllWhere(params);

    const movements = await this.prisma.consumableMovement.findMany({
      where,
      include: movementDetailInclude,
      orderBy: [{ movementDate: 'desc' }, { createdAt: 'desc' }],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Movimientos');

    worksheet.columns = [
      { header: 'FOLIO', key: 'folio', width: 16 },
      { header: 'TIPO', key: 'movementType', width: 14 },
      { header: 'FECHA_MOVIMIENTO', key: 'movementDate', width: 24 },
      { header: 'BODEGA', key: 'warehouseName', width: 24 },
      { header: 'DEPARTAMENTO', key: 'departmentName', width: 28 },
      { header: 'EMPLEADO', key: 'employeeName', width: 28 },
      { header: 'ENTREGO', key: 'deliveredByName', width: 24 },
      { header: 'OBSERVACIONES', key: 'notes', width: 40 },
      { header: 'FIRMA', key: 'signaturePath', width: 36 },
      { header: 'DOCUMENTO', key: 'documentPath', width: 36 },
      { header: 'CODIGO_ARTICULO', key: 'itemCodeSnapshot', width: 28 },
      { header: 'ARTICULO', key: 'itemNameSnapshot', width: 40 },
      { header: 'CANTIDAD', key: 'quantity', width: 14 },
      { header: 'UNIDAD', key: 'unit', width: 12 },
      { header: 'NOTAS_ITEM', key: 'itemNotes', width: 32 },
      { header: 'STOCK_ACTUAL_ITEM', key: 'currentItemStock', width: 18 },
      { header: 'CREADO_POR', key: 'createdByName', width: 24 },
      { header: 'CREADO_EN', key: 'createdAt', width: 24 },
    ];

    worksheet.getRow(1).font = { bold: true };

    for (const movement of movements) {
      for (const item of movement.items) {
        worksheet.addRow({
          folio: movement.folio,
          movementType: movement.movementType,
          movementDate: movement.movementDate.toISOString(),
          warehouseName: movement.warehouse?.name ?? '',
          departmentName: movement.department?.name ?? '',
          employeeName: movement.employeeName ?? '',
          deliveredByName: movement.deliveredByName ?? '',
          notes: movement.notes ?? '',
          signaturePath: movement.signaturePath ?? '',
          documentPath: movement.documentPath ?? '',
          itemCodeSnapshot: item.itemCodeSnapshot ?? '',
          itemNameSnapshot: item.itemNameSnapshot,
          quantity: Number(item.quantity),
          unit: item.unit,
          itemNotes: item.notes ?? '',
          currentItemStock: Number(item.consumableItem.currentStock),
          createdByName: movement.createdBy.fullName,
          createdAt: movement.createdAt.toISOString(),
        });
      }
    }

    const raw = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
  }

  async findOne(id: string) {
    const movement = await this.prisma.consumableMovement.findUnique({
      where: { id },
      include: movementDetailInclude,
    });

    if (!movement) {
      throw new NotFoundException('El movimiento no existe');
    }

    return {
      ok: true,
      message: 'Movimiento de consumibles obtenido correctamente',
      data: this.mapMovementResponse(movement),
    };
  }

  async create(
    createConsumableMovementDto: CreateConsumableMovementDto,
    actorUserId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const warehouse = await tx.warehouse.findFirst({
        where: {
          id: createConsumableMovementDto.warehouseId,
          isActive: true,
        },
      });

      if (!warehouse) {
        throw new NotFoundException(
          'La bodega indicada no existe o está inactiva',
        );
      }

      const department = await tx.department.findFirst({
        where: {
          id: createConsumableMovementDto.departmentId,
          isActive: true,
        },
      });

      if (!department) {
        throw new NotFoundException(
          'El departamento indicado no existe o está inactivo',
        );
      }

      const normalizedMovementType = this.normalizeText(
        createConsumableMovementDto.movementType,
      );

      if (
        normalizedMovementType !== 'ENTRY' &&
        normalizedMovementType !== 'EXIT'
      ) {
        throw new BadRequestException(
          'El tipo de movimiento debe ser ENTRY o EXIT',
        );
      }

      const normalizedEmployeeName = this.normalizeText(
        createConsumableMovementDto.employeeName,
      );

      const normalizedDeliveredByName = this.normalizeText(
        createConsumableMovementDto.deliveredByName,
      );

      const normalizedNotes = this.normalizeText(
        createConsumableMovementDto.notes,
      );

      const normalizedSignaturePath = this.normalizePath(
        createConsumableMovementDto.signaturePath,
      );

      const normalizedDocumentPath = this.normalizePath(
        createConsumableMovementDto.documentPath,
      );

      if (!normalizedEmployeeName) {
        throw new BadRequestException(
          'employeeName es obligatorio para el movimiento',
        );
      }

      if (!normalizedDeliveredByName) {
        throw new BadRequestException(
          'deliveredByName es obligatorio para el movimiento',
        );
      }

      if (!normalizedNotes) {
        throw new BadRequestException('notes es obligatorio para el movimiento');
      }

      if (!normalizedSignaturePath) {
        throw new BadRequestException(
          'signaturePath es obligatorio para el movimiento',
        );
      }

      if (!normalizedDocumentPath) {
        throw new BadRequestException(
          'documentPath es obligatorio para el movimiento',
        );
      }

      const itemIds = createConsumableMovementDto.items.map(
        (item) => item.consumableItemId,
      );

      const uniqueItemIds = [...new Set(itemIds)];

      if (uniqueItemIds.length !== itemIds.length) {
        throw new BadRequestException(
          'No se permiten consumibles duplicados en el mismo movimiento',
        );
      }

      const consumableItems = await tx.consumableItem.findMany({
        where: {
          id: {
            in: uniqueItemIds,
          },
          isActive: true,
        },
      });

      if (consumableItems.length !== uniqueItemIds.length) {
        throw new NotFoundException(
          'Uno o más consumibles no existen o están inactivos',
        );
      }

      const consumableMap = new Map(
        consumableItems.map((item) => [item.id, item]),
      );

      if (normalizedMovementType === 'EXIT') {
        for (const movementItem of createConsumableMovementDto.items) {
          const consumable = consumableMap.get(movementItem.consumableItemId);

          if (!consumable) {
            throw new NotFoundException(
              'Uno o más consumibles no existen o están inactivos',
            );
          }

          const currentStock = Number(consumable.currentStock);
          const requestedQuantity = movementItem.quantity;

          if (requestedQuantity > currentStock) {
            throw new BadRequestException(
              `Stock insuficiente para ${consumable.name}. Stock actual: ${currentStock}, solicitado: ${requestedQuantity}`,
            );
          }
        }
      }

      const folio = await this.getNextMovementFolio(
        tx as unknown as PrismaService,
      );

      const movement = await tx.consumableMovement.create({
        data: {
          folio,
          movementType: normalizedMovementType,
          warehouseId: warehouse.id,
          departmentId: department.id,
          employeeName: normalizedEmployeeName,
          deliveredByName: normalizedDeliveredByName,
          movementDate: new Date(createConsumableMovementDto.movementDate),
          signaturePath: normalizedSignaturePath,
          documentPath: normalizedDocumentPath,
          notes: normalizedNotes,
          createdByUserId: actorUserId,
          items: {
            create: createConsumableMovementDto.items.map((movementItem) => {
              const consumable = consumableMap.get(
                movementItem.consumableItemId,
              );

              if (!consumable) {
                throw new NotFoundException(
                  'Uno o más consumibles no existen o están inactivos',
                );
              }

              return {
                consumableItemId: consumable.id,
                quantity: movementItem.quantity,
                unit: consumable.unit,
                itemNameSnapshot: consumable.name,
                itemCodeSnapshot: consumable.code,
                notes: this.normalizeText(movementItem.notes) ?? null,
              };
            }),
          },
        },
        include: movementDetailInclude,
      });

      for (const movementItem of createConsumableMovementDto.items) {
        const consumable = consumableMap.get(movementItem.consumableItemId);

        if (!consumable) {
          throw new NotFoundException(
            'Uno o más consumibles no existen o están inactivos',
          );
        }

        const currentStock = Number(consumable.currentStock);
        const quantity = movementItem.quantity;

        const newStock =
          normalizedMovementType === 'ENTRY'
            ? currentStock + quantity
            : currentStock - quantity;

        await tx.consumableItem.update({
          where: { id: consumable.id },
          data: {
            currentStock: newStock,
          },
        });
      }

      const movementWithUpdatedStock = await tx.consumableMovement.findUnique({
        where: { id: movement.id },
        include: movementDetailInclude,
      });

      if (!movementWithUpdatedStock) {
        throw new NotFoundException('El movimiento creado no pudo recuperarse');
      }

      return {
        ok: true,
        message: 'Movimiento de consumibles creado correctamente',
        data: this.mapMovementResponse(movementWithUpdatedStock),
      };
    });
  }
}