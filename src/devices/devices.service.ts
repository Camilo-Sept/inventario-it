import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SecretsService } from '../security/secrets.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

type FindAllDevicesParams = {
  search?: string;
  warehouseId?: string;
  branchId?: string;
  deviceTypeId?: string;
  brandId?: string;
  status?: string;
};

const deviceDetailInclude = {
  warehouse: {
    include: {
      branch: true,
    },
  },
  deviceType: true,
  brand: true,
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
  updatedBy: {
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      status: true,
    },
  },
} as const;

type DeviceWithRelations = Prisma.DeviceGetPayload<{
  include: typeof deviceDetailInclude;
}>;

const deviceAssignmentHistoryInclude = {
  warehouse: {
    include: {
      branch: true,
    },
  },
  department: true,
  assignedBy: {
    select: {
      id: true,
      fullName: true,
      username: true,
      email: true,
      status: true,
    },
  },
} as const;

type DeviceAssignmentHistoryItem = Prisma.DeviceAssignmentGetPayload<{
  include: typeof deviceAssignmentHistoryInclude;
}>;

@Injectable()
export class DevicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly secretsService: SecretsService,
  ) {}

  private async getNextDeviceCode(
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    const sequence = await tx.appSequence.findUnique({
      where: { code: 'DEVICE' },
    });

    if (!sequence || !sequence.isActive) {
      throw new NotFoundException(
        'La secuencia DEVICE no existe o está inactiva',
      );
    }

    const nextValue = sequence.currentValue + 1;

    await tx.appSequence.update({
      where: { code: 'DEVICE' },
      data: {
        currentValue: nextValue,
      },
    });

    return `${sequence.prefix}-${String(nextValue).padStart(4, '0')}`;
  }

  private normalizeText(value?: string | null): string | null | undefined {
    if (value === undefined) return undefined;
    if (value === null) return null;

    const normalized = value.trim().replace(/\s+/g, ' ').toUpperCase();
    return normalized.length ? normalized : null;
  }

  private mapDeviceResponse(device: DeviceWithRelations) {
    return {
      id: device.id,
      deviceCode: device.deviceCode,
      serialNumber: device.serialNumber,
      model: device.model,
      partNumber: device.partNumber,
      description: device.description,
      invoiceNumber: device.invoiceNumber,
      cost: device.cost ? Number(device.cost) : null,
      purchaseDate: device.purchaseDate,
      status: device.status,
      phoneNumber: device.phoneNumber,
      imei: device.imei,
      iccid: device.iccid,
      simNumber: device.simNumber,
      gmailAccount: device.gmailAccount,
      teamviewerId: device.teamviewerId,
      computerName: device.computerName,
      qrCode: device.qrCode,
      barcode: device.barcode,
      notes: device.notes,

      warehouseId: device.warehouseId,
      warehouseName: device.warehouse.name,
      warehouseCode: device.warehouse.code,

      branchId: device.warehouse.branch.id,
      branchName: device.warehouse.branch.name,
      branchCode: device.warehouse.branch.code,

      deviceTypeId: device.deviceTypeId,
      deviceTypeName: device.deviceType.name,
      deviceTypeCode: device.deviceType.code,

      brandId: device.brandId,
      brandName: device.brand.name,

      currentResponsibleName: device.currentResponsibleName,

      departmentId: device.departmentId,
      departmentName: device.department?.name ?? null,
      departmentCode: device.department?.code ?? null,

      createdByUserId: device.createdByUserId,
      createdByName: device.createdBy.fullName,
      createdByUsername: device.createdBy.username,
      createdByEmail: device.createdBy.email,

      updatedByUserId: device.updatedByUserId,
      updatedByName: device.updatedBy.fullName,
      updatedByUsername: device.updatedBy.username,
      updatedByEmail: device.updatedBy.email,

      createdAt: device.createdAt,
      updatedAt: device.updatedAt,
    };
  }

  private mapAssignmentHistoryItem(
    assignment: DeviceAssignmentHistoryItem,
  ) {
    return {
      id: assignment.id,
      assignedToName: assignment.assignedToName,
      status: assignment.status,
      assignedAt: assignment.assignedAt,
      returnedAt: assignment.returnedAt,
      deliveryNotes: assignment.deliveryNotes,
      devicePhotoPath: assignment.devicePhotoPath,
      deliveryDocumentPath: assignment.deliveryDocumentPath,
      policyDocumentPath: assignment.policyDocumentPath,
      signaturePath: assignment.signaturePath,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,

      assignedByUserId: assignment.assignedByUserId,
      assignedByName: assignment.assignedBy.fullName,
      assignedByUsername: assignment.assignedBy.username,
      assignedByEmail: assignment.assignedBy.email,
      assignedByStatus: assignment.assignedBy.status,

      warehouseId: assignment.warehouseId,
      warehouseName: assignment.warehouse.name,
      warehouseCode: assignment.warehouse.code,

      branchId: assignment.warehouse.branch.id,
      branchName: assignment.warehouse.branch.name,
      branchCode: assignment.warehouse.branch.code,

      departmentId: assignment.departmentId,
      departmentName: assignment.department?.name ?? null,
      departmentCode: assignment.department?.code ?? null,
    };
  }

  async findAll(params: FindAllDevicesParams = {}) {
    const {
      search,
      warehouseId,
      branchId,
      deviceTypeId,
      brandId,
      status,
    } = params;

    const where: Prisma.DeviceWhereInput = {
      deletedAt: null,
    };

    if (search && search.trim()) {
      const searchValue = search.trim();

      where.OR = [
        {
          deviceCode: {
            contains: searchValue,
            mode: 'insensitive',
          },
        },
        {
          serialNumber: {
            contains: searchValue,
            mode: 'insensitive',
          },
        },
        {
          model: {
            contains: searchValue,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: searchValue,
            mode: 'insensitive',
          },
        },
        {
          computerName: {
            contains: searchValue,
            mode: 'insensitive',
          },
        },
        {
          currentResponsibleName: {
            contains: searchValue,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    if (branchId) {
      where.warehouse = {
        branchId,
      };
    }

    if (deviceTypeId) {
      where.deviceTypeId = deviceTypeId;
    }

    if (brandId) {
      where.brandId = brandId;
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    const devices = await this.prisma.device.findMany({
      where,
      include: deviceDetailInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const data = devices.map((device) => this.mapDeviceResponse(device));

    return {
      ok: true,
      message: 'Dispositivos obtenidos correctamente',
      total: data.length,
      filters: {
        search: search ?? null,
        warehouseId: warehouseId ?? null,
        branchId: branchId ?? null,
        deviceTypeId: deviceTypeId ?? null,
        brandId: brandId ?? null,
        status: status ?? null,
      },
      data,
    };
  }

  async findOne(id: string) {
    const device = await this.prisma.device.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: deviceDetailInclude,
    });

    if (!device) {
      throw new NotFoundException('El dispositivo no existe');
    }

    return {
      ok: true,
      message: 'Dispositivo obtenido correctamente',
      data: this.mapDeviceResponse(device),
    };
  }

  async findAssignments(id: string) {
    const device = await this.prisma.device.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        warehouse: {
          include: {
            branch: true,
          },
        },
        deviceType: true,
        brand: true,
      },
    });

    if (!device) {
      throw new NotFoundException('El dispositivo no existe');
    }

    const assignments = await this.prisma.deviceAssignment.findMany({
      where: {
        deviceId: id,
      },
      include: deviceAssignmentHistoryInclude,
      orderBy: {
        assignedAt: 'desc',
      },
    });

    return {
      ok: true,
      message: 'Historial de asignaciones obtenido correctamente',
      data: {
        device: {
          id: device.id,
          deviceCode: device.deviceCode,
          serialNumber: device.serialNumber,
          model: device.model,
          status: device.status,
          warehouseId: device.warehouseId,
          warehouseName: device.warehouse.name,
          warehouseCode: device.warehouse.code,
          branchId: device.warehouse.branch.id,
          branchName: device.warehouse.branch.name,
          branchCode: device.warehouse.branch.code,
          deviceTypeId: device.deviceTypeId,
          deviceTypeName: device.deviceType.name,
          brandId: device.brandId,
          brandName: device.brand.name,
        },
        total: assignments.length,
        assignments: assignments.map((assignment) =>
          this.mapAssignmentHistoryItem(assignment),
        ),
      },
    };
  }

  async create(createDeviceDto: CreateDeviceDto, actorUserId: string) {
    return this.prisma.$transaction(async (tx) => {
      const warehouse = await tx.warehouse.findFirst({
        where: {
          code: 'ALMACEN_IT',
          isActive: true,
        },
      });

      if (!warehouse) {
        throw new NotFoundException(
          'La bodega ALMACEN IT no existe o está inactiva',
        );
      }

      const deviceType = await tx.deviceType.findFirst({
        where: {
          id: createDeviceDto.deviceTypeId,
          isActive: true,
        },
      });

      if (!deviceType) {
        throw new NotFoundException(
          'El tipo de equipo indicado no existe o está inactivo',
        );
      }

      const brand = await tx.brand.findFirst({
        where: {
          id: createDeviceDto.brandId,
          isActive: true,
        },
      });

      if (!brand) {
        throw new NotFoundException(
          'La marca indicada no existe o está inactiva',
        );
      }

      if (createDeviceDto.departmentId) {
        const department = await tx.department.findFirst({
          where: {
            id: createDeviceDto.departmentId,
            isActive: true,
          },
        });

        if (!department) {
          throw new NotFoundException(
            'El departamento indicado no existe o está inactivo',
          );
        }
      }

      const existingSerial = await tx.device.findUnique({
        where: {
          serialNumber: createDeviceDto.serialNumber,
        },
      });

      if (existingSerial) {
        throw new ConflictException('El número de serie ya está registrado');
      }

      const deviceCode = await this.getNextDeviceCode(tx);

      const device = await tx.device.create({
        data: {
          deviceCode,
          warehouseId: warehouse.id,
          deviceTypeId: createDeviceDto.deviceTypeId,
          brandId: createDeviceDto.brandId,
          serialNumber: createDeviceDto.serialNumber,
          currentResponsibleName:
            this.normalizeText(createDeviceDto.currentResponsibleName) ?? null,
          departmentId: createDeviceDto.departmentId ?? null,
          simNumber: this.normalizeText(createDeviceDto.simNumber) ?? null,
          phoneNumber: this.normalizeText(createDeviceDto.phoneNumber) ?? null,
          invoiceNumber:
            this.normalizeText(createDeviceDto.invoiceNumber) ?? null,
          cost:
            createDeviceDto.cost !== undefined ? createDeviceDto.cost : null,
          description:
            this.normalizeText(createDeviceDto.description) ?? null,
          partNumber: this.normalizeText(createDeviceDto.partNumber) ?? null,
          model: this.normalizeText(createDeviceDto.model) ?? null,
          purchaseDate: createDeviceDto.purchaseDate
            ? new Date(createDeviceDto.purchaseDate)
            : null,
          wifiMac: this.normalizeText(createDeviceDto.wifiMac) ?? null,
          bluetoothMac:
            this.normalizeText(createDeviceDto.bluetoothMac) ?? null,
          status: this.normalizeText(createDeviceDto.status) ?? 'AVAILABLE',
          imei: this.normalizeText(createDeviceDto.imei) ?? null,
          iccid: this.normalizeText(createDeviceDto.iccid) ?? null,
          localPasswordEncrypted:
            createDeviceDto.localPasswordEncrypted !== undefined
              ? this.secretsService.encrypt(
                  createDeviceDto.localPasswordEncrypted,
                )
              : null,
          gmailAccount:
            this.normalizeText(createDeviceDto.gmailAccount) ?? null,
          gmailPasswordEncrypted:
            createDeviceDto.gmailPasswordEncrypted !== undefined
              ? this.secretsService.encrypt(
                  createDeviceDto.gmailPasswordEncrypted,
                )
              : null,
          computerName:
            this.normalizeText(createDeviceDto.computerName) ?? null,
          teamviewerId:
            this.normalizeText(createDeviceDto.teamviewerId) ?? null,
          qrCode: this.normalizeText(createDeviceDto.qrCode) ?? null,
          barcode: this.normalizeText(createDeviceDto.barcode) ?? null,
          notes: this.normalizeText(createDeviceDto.notes) ?? null,
          createdByUserId: actorUserId,
          updatedByUserId: actorUserId,
        },
        include: deviceDetailInclude,
      });

      return {
        ok: true,
        message: 'Dispositivo creado correctamente',
        data: this.mapDeviceResponse(device),
      };
    });
  }

  async update(
    id: string,
    updateDeviceDto: UpdateDeviceDto,
    actorUserId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const existingDevice = await tx.device.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!existingDevice) {
        throw new NotFoundException('El dispositivo no existe');
      }

      if (updateDeviceDto.warehouseId !== undefined) {
        const warehouse = await tx.warehouse.findFirst({
          where: {
            id: updateDeviceDto.warehouseId,
            isActive: true,
          },
        });

        if (!warehouse) {
          throw new NotFoundException(
            'La bodega indicada no existe o está inactiva',
          );
        }
      }

      if (updateDeviceDto.deviceTypeId !== undefined) {
        const deviceType = await tx.deviceType.findFirst({
          where: {
            id: updateDeviceDto.deviceTypeId,
            isActive: true,
          },
        });

        if (!deviceType) {
          throw new NotFoundException(
            'El tipo de equipo indicado no existe o está inactivo',
          );
        }
      }

      if (updateDeviceDto.brandId !== undefined) {
        const brand = await tx.brand.findFirst({
          where: {
            id: updateDeviceDto.brandId,
            isActive: true,
          },
        });

        if (!brand) {
          throw new NotFoundException(
            'La marca indicada no existe o está inactiva',
          );
        }
      }

      if (
        updateDeviceDto.departmentId !== undefined &&
        updateDeviceDto.departmentId !== null
      ) {
        const department = await tx.department.findFirst({
          where: {
            id: updateDeviceDto.departmentId,
            isActive: true,
          },
        });

        if (!department) {
          throw new NotFoundException(
            'El departamento indicado no existe o está inactivo',
          );
        }
      }

      if (
        updateDeviceDto.serialNumber !== undefined &&
        updateDeviceDto.serialNumber !== existingDevice.serialNumber
      ) {
        const serialInUse = await tx.device.findFirst({
          where: {
            serialNumber: updateDeviceDto.serialNumber,
            id: {
              not: id,
            },
          },
        });

        if (serialInUse) {
          throw new ConflictException('El número de serie ya está registrado');
        }
      }

      const updateData: Prisma.DeviceUncheckedUpdateInput = {
        updatedByUserId: actorUserId,
      };

      if (updateDeviceDto.warehouseId !== undefined) {
        updateData.warehouseId = updateDeviceDto.warehouseId;
      }

      if (updateDeviceDto.deviceTypeId !== undefined) {
        updateData.deviceTypeId = updateDeviceDto.deviceTypeId;
      }

      if (updateDeviceDto.brandId !== undefined) {
        updateData.brandId = updateDeviceDto.brandId;
      }

      if (updateDeviceDto.serialNumber !== undefined) {
        updateData.serialNumber = updateDeviceDto.serialNumber;
      }

      if (updateDeviceDto.currentResponsibleName !== undefined) {
        updateData.currentResponsibleName = this.normalizeText(
          updateDeviceDto.currentResponsibleName,
        );
      }

      if (updateDeviceDto.departmentId !== undefined) {
        updateData.departmentId = updateDeviceDto.departmentId;
      }

      if (updateDeviceDto.simNumber !== undefined) {
        updateData.simNumber = this.normalizeText(
          updateDeviceDto.simNumber,
        );
      }

      if (updateDeviceDto.phoneNumber !== undefined) {
        updateData.phoneNumber = this.normalizeText(
          updateDeviceDto.phoneNumber,
        );
      }

      if (updateDeviceDto.invoiceNumber !== undefined) {
        updateData.invoiceNumber = this.normalizeText(
          updateDeviceDto.invoiceNumber,
        );
      }

      if (updateDeviceDto.cost !== undefined) {
        updateData.cost = updateDeviceDto.cost;
      }

      if (updateDeviceDto.description !== undefined) {
        updateData.description = this.normalizeText(
          updateDeviceDto.description,
        );
      }

      if (updateDeviceDto.partNumber !== undefined) {
        updateData.partNumber = this.normalizeText(
          updateDeviceDto.partNumber,
        );
      }

      if (updateDeviceDto.model !== undefined) {
        updateData.model = this.normalizeText(updateDeviceDto.model);
      }

      if (updateDeviceDto.purchaseDate !== undefined) {
        updateData.purchaseDate = updateDeviceDto.purchaseDate
          ? new Date(updateDeviceDto.purchaseDate)
          : null;
      }

      if (updateDeviceDto.wifiMac !== undefined) {
        updateData.wifiMac = this.normalizeText(updateDeviceDto.wifiMac);
      }

      if (updateDeviceDto.bluetoothMac !== undefined) {
        updateData.bluetoothMac = this.normalizeText(
          updateDeviceDto.bluetoothMac,
        );
      }

      if (updateDeviceDto.status !== undefined) {
        const normalizedStatus = this.normalizeText(updateDeviceDto.status);

        if (normalizedStatus) {
          updateData.status = normalizedStatus;
        }
      }

      if (updateDeviceDto.imei !== undefined) {
        updateData.imei = this.normalizeText(updateDeviceDto.imei);
      }

      if (updateDeviceDto.iccid !== undefined) {
        updateData.iccid = this.normalizeText(updateDeviceDto.iccid);
      }

      if (updateDeviceDto.localPasswordEncrypted !== undefined) {
        updateData.localPasswordEncrypted = this.secretsService.encrypt(
          updateDeviceDto.localPasswordEncrypted,
        );
      }

      if (updateDeviceDto.gmailAccount !== undefined) {
        updateData.gmailAccount = this.normalizeText(
          updateDeviceDto.gmailAccount,
        );
      }

      if (updateDeviceDto.gmailPasswordEncrypted !== undefined) {
        updateData.gmailPasswordEncrypted = this.secretsService.encrypt(
          updateDeviceDto.gmailPasswordEncrypted,
        );
      }

      if (updateDeviceDto.computerName !== undefined) {
        updateData.computerName = this.normalizeText(
          updateDeviceDto.computerName,
        );
      }

      if (updateDeviceDto.teamviewerId !== undefined) {
        updateData.teamviewerId = this.normalizeText(
          updateDeviceDto.teamviewerId,
        );
      }

      if (updateDeviceDto.qrCode !== undefined) {
        updateData.qrCode = this.normalizeText(updateDeviceDto.qrCode);
      }

      if (updateDeviceDto.barcode !== undefined) {
        updateData.barcode = this.normalizeText(updateDeviceDto.barcode);
      }

      if (updateDeviceDto.notes !== undefined) {
        updateData.notes = this.normalizeText(updateDeviceDto.notes);
      }

      const updatedDevice = await tx.device.update({
        where: { id },
        data: updateData,
        include: deviceDetailInclude,
      });

      return {
        ok: true,
        message: 'Dispositivo actualizado correctamente',
        data: this.mapDeviceResponse(updatedDevice),
      };
    });
  }
}
