import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WarehousesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.warehouse.findMany({
      where: {
        isActive: true,
      },
      include: {
        branch: true,
      },
      orderBy: [{ branch: { name: 'asc' } }, { name: 'asc' }],
    });
  }
}