import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateDeviceAssignmentDto } from './dto/create-device-assignment.dto';
import { ReturnDeviceAssignmentDto } from './dto/return-device-assignment.dto';
import { DeviceAssignmentsService } from './device-assignments.service';

@Controller('device-assignments')
export class DeviceAssignmentsController {
  constructor(
    private readonly deviceAssignmentsService: DeviceAssignmentsService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('deviceId') deviceId?: string,
    @Query('status') status?: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.deviceAssignmentsService.findAll({
      search,
      deviceId,
      status,
      warehouseId,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(
    @Body() createDeviceAssignmentDto: CreateDeviceAssignmentDto,
    @Req() req: Request,
  ) {
    const user = req.user as { userId: string };

    return this.deviceAssignmentsService.create(
      createDeviceAssignmentDto,
      user.userId,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/return')
  returnAssignment(
    @Param('id') id: string,
    @Body() returnDeviceAssignmentDto: ReturnDeviceAssignmentDto,
    @Req() req: Request,
  ) {
    const user = req.user as { userId: string };

    return this.deviceAssignmentsService.returnAssignment(
      id,
      returnDeviceAssignmentDto,
      user.userId,
    );
  }
}