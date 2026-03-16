import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DeviceTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.deviceType.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}