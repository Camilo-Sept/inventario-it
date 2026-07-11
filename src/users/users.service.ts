import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        role: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByEmailOrUsername(identifier: string) {
    return this.prisma.user.findFirst({
      where: {
        deletedAt: null,
        OR: [{ email: identifier }, { username: identifier }],
      },
      include: {
        role: true,
      },
    });
  }

  async findActiveById(userId: string) {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
        status: 'ACTIVE',
      },
      include: {
        role: true,
      },
    });
  }

  async create(createUserDto: CreateUserDto) {
    const role = await this.prisma.role.findFirst({
      where: {
        code: createUserDto.roleCode,
        isActive: true,
      },
    });

    if (!role) {
      throw new NotFoundException('El rol indicado no existe o está inactivo');
    }

    const existingByEmail = await this.prisma.user.findUnique({
      where: {
        email: createUserDto.email,
      },
    });

    if (existingByEmail) {
      throw new ConflictException('El email ya está registrado');
    }

    const existingByUsername = await this.prisma.user.findUnique({
      where: {
        username: createUserDto.username,
      },
    });

    if (existingByUsername) {
      throw new ConflictException('El username ya está registrado');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        roleId: role.id,
        email: createUserDto.email,
        username: createUserDto.username,
        passwordHash,
        fullName: createUserDto.fullName,
        phone: createUserDto.phone ?? null,
        status: 'ACTIVE',
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new BadRequestException('No se pudo crear el usuario');
    }

    return {
      ok: true,
      message: 'Usuario creado correctamente',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        phone: user.phone,
        status: user.status,
        role: {
          id: user.role.id,
          code: user.role.code,
          name: user.role.name,
        },
      },
    };
  }

  async updateStatus(userId: string, updateUserStatusDto: UpdateUserStatusDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      include: {
        role: true,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        status: updateUserStatusDto.status,
      },
      include: {
        role: true,
      },
    });

    return {
      ok: true,
      message: 'Estatus de usuario actualizado correctamente',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        status: updatedUser.status,
        role: {
          id: updatedUser.role.id,
          code: updatedUser.role.code,
          name: updatedUser.role.name,
        },
      },
    };
  }

  async updateRole(userId: string, updateUserRoleDto: UpdateUserRoleDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      include: {
        role: true,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const role = await this.prisma.role.findFirst({
      where: {
        code: updateUserRoleDto.roleCode,
        isActive: true,
      },
    });

    if (!role) {
      throw new NotFoundException('El rol indicado no existe o está inactivo');
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        roleId: role.id,
      },
      include: {
        role: true,
      },
    });

    return {
      ok: true,
      message: 'Rol de usuario actualizado correctamente',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        status: updatedUser.status,
        role: {
          id: updatedUser.role.id,
          code: updatedUser.role.code,
          name: updatedUser.role.name,
        },
      },
    };
  }
}
