import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceAssignmentDto } from './dto/create-device-assignment.dto';
import { ReturnDeviceAssignmentDto } from './dto/return-device-assignment.dto';

type FindAllDeviceAssignmentsParams = {
  search?: string;
  deviceId?: string;
  status?: string;
  warehouseId?: string;
};

const deviceAssignmentDetailInclude = {
  device: {
    select: {
      id: true,
      deviceCode: true,
      serialNumber: true,
      model: true,
      status: true,
    },
  },
  assignedBy: {
    select: {
      id: true,
      fullName: true,
      username: true,
      email: true,
      status: true,
    },
  },
  warehouse: {
    include: {
      branch: true,
    },
  },
  department: true,
} as const;

type DeviceAssignmentWithRelations =
  Prisma.DeviceAssignmentGetPayload<{
    include: typeof deviceAssignmentDetailInclude;
  }>;

@Injectable()
export class DeviceAssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeText(value?: string | null): string | null | undefined {
    if (value === undefined) return undefined;
    if (value === null) return null;

    const normalized = value.trim().replace(/\s+/g, ' ').toUpperCase();
    return normalized.length ? normalized : null;
  }

  private mapAssignmentResponse(
    assignment: DeviceAssignmentWithRelations,
  ) {
    return {
      id: assignment.id,
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

      deviceId: assignment.deviceId,
      deviceCode: assignment.device.deviceCode,
      deviceSerialNumber: assignment.device.serialNumber,
      deviceModel: assignment.device.model,
      deviceStatus: assignment.device.status,

      assignedToName: assignment.assignedToName,

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

  async findAll(params: FindAllDeviceAssignmentsParams = {}) {
    const { search, deviceId, status, warehouseId } = params;

    const where: Prisma.DeviceAssignmentWhereInput = {};

    if (search && search.trim()) {
      const searchValue = search.trim();

      where.OR = [
        {
          assignedToName: {
            contains: searchValue,
            mode: 'insensitive',
          },
        },
        {
          device: {
            deviceCode: {
              contains: searchValue,
              mode: 'insensitive',
            },
          },
        },
        {
          device: {
            serialNumber: {
              contains: searchValue,
              mode: 'insensitive',
            },
          },
        },
        {
          device: {
            model: {
              contains: searchValue,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    if (deviceId) {
      where.deviceId = deviceId;
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    const assignments = await this.prisma.deviceAssignment.findMany({
      where,
      include: deviceAssignmentDetailInclude,
      orderBy: {
        assignedAt: 'desc',
      },
    });

    const data = assignments.map((assignment) =>
      this.mapAssignmentResponse(assignment),
    );

    return {
      ok: true,
      message: 'Asignaciones obtenidas correctamente',
      total: data.length,
      filters: {
        search: search ?? null,
        deviceId: deviceId ?? null,
        status: status ?? null,
        warehouseId: warehouseId ?? null,
      },
      data,
    };
  }

  async create(
    createDeviceAssignmentDto: CreateDeviceAssignmentDto,
    actorUserId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const device = await tx.device.findFirst({
        where: {
          id: createDeviceAssignmentDto.deviceId,
          deletedAt: null,
        },
      });

      if (!device) {
        throw new NotFoundException('El dispositivo indicado no existe');
      }

      if (device.status === 'RETIRED') {
        throw new ConflictException(
          'No se puede asignar un dispositivo dado de baja',
        );
      }

      const activeAssignment = await tx.deviceAssignment.findFirst({
        where: {
          deviceId: createDeviceAssignmentDto.deviceId,
          status: 'ACTIVE',
          returnedAt: null,
        },
      });

      if (activeAssignment) {
        throw new ConflictException(
          'El dispositivo ya tiene una asignación activa',
        );
      }

      const warehouse = await tx.warehouse.findFirst({
        where: {
          id: createDeviceAssignmentDto.warehouseId,
          isActive: true,
        },
      });

      if (!warehouse) {
        throw new NotFoundException(
          'La bodega indicada no existe o está inactiva',
        );
      }

      if (createDeviceAssignmentDto.departmentId) {
        const department = await tx.department.findFirst({
          where: {
            id: createDeviceAssignmentDto.departmentId,
            isActive: true,
          },
        });

        if (!department) {
          throw new NotFoundException(
            'El departamento indicado no existe o está inactivo',
          );
        }
      }

      const assignedToName = this.normalizeText(
        createDeviceAssignmentDto.assignedToName,
      );

      if (!assignedToName) {
        throw new ConflictException(
          'El nombre del responsable es obligatorio',
        );
      }

      await tx.device.update({
        where: {
          id: device.id,
        },
        data: {
          warehouseId: warehouse.id,
          currentResponsibleName: assignedToName,
          departmentId:
            createDeviceAssignmentDto.departmentId ?? null,
          status: 'ASSIGNED',
          updatedByUserId: actorUserId,
        },
      });

      const assignment = await tx.deviceAssignment.create({
        data: {
          deviceId: device.id,
          assignedToName,
          assignedByUserId: actorUserId,
          warehouseId: warehouse.id,
          departmentId:
            createDeviceAssignmentDto.departmentId ?? null,
          assignedAt: new Date(createDeviceAssignmentDto.assignedAt),
          status: 'ACTIVE',
          deliveryNotes:
            this.normalizeText(
              createDeviceAssignmentDto.deliveryNotes,
            ) ?? null,
          devicePhotoPath:
            this.normalizeText(
              createDeviceAssignmentDto.devicePhotoPath,
            ) ?? null,
          deliveryDocumentPath:
            this.normalizeText(
              createDeviceAssignmentDto.deliveryDocumentPath,
            ) ?? null,
          policyDocumentPath:
            this.normalizeText(
              createDeviceAssignmentDto.policyDocumentPath,
            ) ?? null,
          signaturePath:
            this.normalizeText(
              createDeviceAssignmentDto.signaturePath,
            ) ?? null,
        },
        include: deviceAssignmentDetailInclude,
      });

      return {
        ok: true,
        message: 'Asignación creada correctamente',
        data: this.mapAssignmentResponse(assignment),
      };
    });
  }

  async returnAssignment(
    id: string,
    returnDeviceAssignmentDto: ReturnDeviceAssignmentDto,
    actorUserId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const existingAssignment =
        await tx.deviceAssignment.findFirst({
          where: {
            id,
          },
        });

      if (!existingAssignment) {
        throw new NotFoundException('La asignación no existe');
      }

      if (
        existingAssignment.status !== 'ACTIVE' ||
        existingAssignment.returnedAt !== null
      ) {
        throw new ConflictException(
          'La asignación ya fue retornada o no está activa',
        );
      }

      const almacenIt = await tx.warehouse.findFirst({
        where: {
          code: 'ALMACEN_IT',
          isActive: true,
        },
      });

      if (!almacenIt) {
        throw new NotFoundException(
          'La bodega ALMACEN IT no existe o está inactiva',
        );
      }

      const returnNotes = this.normalizeText(
        returnDeviceAssignmentDto.returnNotes,
      );
      const previousNotes = existingAssignment.deliveryNotes ?? null;

      const mergedNotes =
        returnNotes && previousNotes
          ? `${previousNotes}\nDEVOLUCION: ${returnNotes}`
          : returnNotes
            ? `DEVOLUCION: ${returnNotes}`
            : previousNotes;

      await tx.device.update({
        where: {
          id: existingAssignment.deviceId,
        },
        data: {
          warehouseId: almacenIt.id,
          currentResponsibleName: null,
          departmentId: null,
          status: 'AVAILABLE',
          updatedByUserId: actorUserId,
        },
      });

      const returnedAssignment =
        await tx.deviceAssignment.update({
          where: {
            id: existingAssignment.id,
          },
          data: {
            status: 'RETURNED',
            returnedAt:
              returnDeviceAssignmentDto.returnedAt
                ? new Date(
                    returnDeviceAssignmentDto.returnedAt,
                  )
                : new Date(),
            deliveryNotes: mergedNotes,
          },
          include: deviceAssignmentDetailInclude,
        });

      return {
        ok: true,
        message: 'Asignación retornada correctamente',
        data: this.mapAssignmentResponse(returnedAssignment),
      };
    });
  }
}
