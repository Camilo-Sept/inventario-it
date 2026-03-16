import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConsumableItemDto } from './dto/create-consumable-item.dto';
import { UpdateConsumableItemDto } from './dto/update-consumable-item.dto';
import ExcelJS from 'exceljs';

type FindAllConsumableItemsParams = {
  search?: string;
  isActive?: string;
};

type ConsumableItemModel = Prisma.ConsumableItemGetPayload<object>;

@Injectable()
export class ConsumableItemsService {
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

  private mapConsumableItemResponse(item: ConsumableItemModel) {
    return {
      id: item.id,
      code: item.code,
      name: item.name,
      info: item.info,
      photoPath: item.photoPath,
      unit: item.unit,
      initialStock: Number(item.initialStock),
      currentStock: Number(item.currentStock),
      minimumStock: Number(item.minimumStock),
      maximumStock:
        item.maximumStock !== null ? Number(item.maximumStock) : null,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private buildFindAllWhere(params: FindAllConsumableItemsParams = {}) {
    const { search, isActive } = params;

    const where: Prisma.ConsumableItemWhereInput = {};

    if (search && search.trim()) {
      const searchValue = search.trim();

      where.OR = [
        { code: { contains: searchValue } },
        { name: { contains: searchValue } },
        { info: { contains: searchValue } },
        { unit: { contains: searchValue } },
      ];
    }

    if (isActive !== undefined) {
      if (isActive === 'true') where.isActive = true;
      if (isActive === 'false') where.isActive = false;
    }

    return where;
  }

  async findAll(params: FindAllConsumableItemsParams = {}) {
    const where = this.buildFindAllWhere(params);

    const items = await this.prisma.consumableItem.findMany({
      where,
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    });

    return {
      ok: true,
      message: 'Consumibles obtenidos correctamente',
      total: items.length,
      filters: {
        search: params.search ?? null,
        isActive: params.isActive ?? null,
      },
      data: items.map((item) => this.mapConsumableItemResponse(item)),
    };
  }

  async exportExcel(params: FindAllConsumableItemsParams = {}) {
    const where = this.buildFindAllWhere(params);

    const items = await this.prisma.consumableItem.findMany({
      where,
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Consumibles');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 28 },
      { header: 'CODIGO', key: 'code', width: 28 },
      { header: 'NOMBRE', key: 'name', width: 40 },
      { header: 'INFO', key: 'info', width: 50 },
      { header: 'RUTA_FOTO', key: 'photoPath', width: 50 },
      { header: 'UNIDAD', key: 'unit', width: 14 },
      { header: 'STOCK_INICIAL', key: 'initialStock', width: 16 },
      { header: 'STOCK_ACTUAL', key: 'currentStock', width: 16 },
      { header: 'MINIMO', key: 'minimumStock', width: 14 },
      { header: 'MAXIMO', key: 'maximumStock', width: 14 },
      { header: 'ACTIVO', key: 'isActive', width: 12 },
      { header: 'CREADO_EN', key: 'createdAt', width: 24 },
      { header: 'ACTUALIZADO_EN', key: 'updatedAt', width: 24 },
    ];

    worksheet.getRow(1).font = { bold: true };

    for (const item of items) {
      worksheet.addRow({
        id: item.id,
        code: item.code,
        name: item.name,
        info: item.info ?? '',
        photoPath: item.photoPath ?? '',
        unit: item.unit,
        initialStock: Number(item.initialStock),
        currentStock: Number(item.currentStock),
        minimumStock: Number(item.minimumStock),
        maximumStock:
          item.maximumStock !== null ? Number(item.maximumStock) : '',
        isActive: item.isActive ? 'SI' : 'NO',
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      });
    }

    const raw = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
  }

  async findOne(id: string) {
    const item = await this.prisma.consumableItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('El consumible no existe');
    }

    return {
      ok: true,
      message: 'Consumible obtenido correctamente',
      data: this.mapConsumableItemResponse(item),
    };
  }

  async findMovements(id: string) {
    const item = await this.prisma.consumableItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('El consumible no existe');
    }

    const movements = await this.prisma.consumableMovement.findMany({
      where: {
        items: {
          some: {
            consumableItemId: id,
          },
        },
      },
      include: {
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
          where: {
            consumableItemId: id,
          },
          include: {
            consumableItem: true,
          },
        },
      },
      orderBy: [{ movementDate: 'desc' }, { createdAt: 'desc' }],
    });

    return {
      ok: true,
      message: 'Historial del consumible obtenido correctamente',
      data: {
        item: this.mapConsumableItemResponse(item),
        total: movements.length,
        movements: movements.map((movement) => ({
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

          items: movement.items.map((movementItem) => ({
            id: movementItem.id,
            consumableItemId: movementItem.consumableItemId,
            quantity: Number(movementItem.quantity),
            unit: movementItem.unit,
            itemNameSnapshot: movementItem.itemNameSnapshot,
            itemCodeSnapshot: movementItem.itemCodeSnapshot,
            notes: movementItem.notes,
            createdAt: movementItem.createdAt,
            currentItemStock: Number(movementItem.consumableItem.currentStock),
          })),
        })),
      },
    };
  }

  async create(createConsumableItemDto: CreateConsumableItemDto) {
    const normalizedCode = this.normalizeText(createConsumableItemDto.code);
    const normalizedName = this.normalizeText(createConsumableItemDto.name);
    const normalizedInfo = this.normalizeText(createConsumableItemDto.info);
    const normalizedPhotoPath = this.normalizePath(
      createConsumableItemDto.photoPath,
    );
    const normalizedUnit = this.normalizeText(createConsumableItemDto.unit);

    if (!normalizedCode) {
      throw new ConflictException('El código del consumible es obligatorio');
    }

    if (!normalizedName) {
      throw new ConflictException('El nombre del consumible es obligatorio');
    }

    if (!normalizedUnit) {
      throw new ConflictException('La unidad del consumible es obligatoria');
    }

    const existingByCode = await this.prisma.consumableItem.findUnique({
      where: { code: normalizedCode },
    });

    if (existingByCode) {
      throw new ConflictException('Ya existe un consumible con ese código');
    }

    const existingByName = await this.prisma.consumableItem.findUnique({
      where: { name: normalizedName },
    });

    if (existingByName) {
      throw new ConflictException('Ya existe un consumible con ese nombre');
    }

    const initialStock = createConsumableItemDto.initialStock ?? 0;
    const currentStock = createConsumableItemDto.currentStock ?? initialStock;
    const minimumStock = createConsumableItemDto.minimumStock ?? 0;

    const item = await this.prisma.consumableItem.create({
      data: {
        code: normalizedCode,
        name: normalizedName,
        info: normalizedInfo ?? null,
        photoPath: normalizedPhotoPath ?? null,
        unit: normalizedUnit,
        initialStock,
        currentStock,
        minimumStock,
        maximumStock:
          createConsumableItemDto.maximumStock !== undefined
            ? createConsumableItemDto.maximumStock
            : null,
        isActive: createConsumableItemDto.isActive ?? true,
      },
    });

    return {
      ok: true,
      message: 'Consumible creado correctamente',
      data: this.mapConsumableItemResponse(item),
    };
  }

  async update(id: string, updateConsumableItemDto: UpdateConsumableItemDto) {
    const existingItem = await this.prisma.consumableItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      throw new NotFoundException('El consumible no existe');
    }

    const updateData: Prisma.ConsumableItemUncheckedUpdateInput = {};

    if (updateConsumableItemDto.code !== undefined) {
      const normalizedCode = this.normalizeText(updateConsumableItemDto.code);

      if (!normalizedCode) {
        throw new ConflictException(
          'El código del consumible no puede quedar vacío',
        );
      }

      const existingByCode = await this.prisma.consumableItem.findFirst({
        where: {
          code: normalizedCode,
          id: { not: id },
        },
      });

      if (existingByCode) {
        throw new ConflictException('Ya existe un consumible con ese código');
      }

      updateData.code = normalizedCode;
    }

    if (updateConsumableItemDto.name !== undefined) {
      const normalizedName = this.normalizeText(updateConsumableItemDto.name);

      if (!normalizedName) {
        throw new ConflictException(
          'El nombre del consumible no puede quedar vacío',
        );
      }

      const existingByName = await this.prisma.consumableItem.findFirst({
        where: {
          name: normalizedName,
          id: { not: id },
        },
      });

      if (existingByName) {
        throw new ConflictException('Ya existe un consumible con ese nombre');
      }

      updateData.name = normalizedName;
    }

    if (updateConsumableItemDto.info !== undefined) {
      updateData.info = this.normalizeText(updateConsumableItemDto.info);
    }

    if (updateConsumableItemDto.photoPath !== undefined) {
      updateData.photoPath = this.normalizePath(
        updateConsumableItemDto.photoPath,
      );
    }

    if (updateConsumableItemDto.unit !== undefined) {
      const normalizedUnit = this.normalizeText(updateConsumableItemDto.unit);

      if (!normalizedUnit) {
        throw new ConflictException(
          'La unidad del consumible no puede quedar vacía',
        );
      }

      updateData.unit = normalizedUnit;
    }

    if (updateConsumableItemDto.initialStock !== undefined) {
      updateData.initialStock = updateConsumableItemDto.initialStock;
    }

    if (updateConsumableItemDto.currentStock !== undefined) {
      updateData.currentStock = updateConsumableItemDto.currentStock;
    }

    if (updateConsumableItemDto.minimumStock !== undefined) {
      updateData.minimumStock = updateConsumableItemDto.minimumStock;
    }

    if (updateConsumableItemDto.maximumStock !== undefined) {
      updateData.maximumStock = updateConsumableItemDto.maximumStock;
    }

    if (updateConsumableItemDto.isActive !== undefined) {
      updateData.isActive = updateConsumableItemDto.isActive;
    }

    const updatedItem = await this.prisma.consumableItem.update({
      where: { id },
      data: updateData,
    });

    return {
      ok: true,
      message: 'Consumible actualizado correctamente',
      data: this.mapConsumableItemResponse(updatedItem),
    };
  }
}