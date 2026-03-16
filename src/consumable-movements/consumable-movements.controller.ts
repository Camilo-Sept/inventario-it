import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateConsumableMovementDto } from './dto/create-consumable-movement.dto';
import { ConsumableMovementsService } from './consumable-movements.service';

@Controller('consumable-movements')
export class ConsumableMovementsController {
  constructor(
    private readonly consumableMovementsService: ConsumableMovementsService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll(
    @Query('folio') folio?: string,
    @Query('movementType') movementType?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('employeeName') employeeName?: string,
    @Query('consumableItemId') consumableItemId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.consumableMovementsService.findAll({
      folio,
      movementType,
      warehouseId,
      departmentId,
      employeeName,
      consumableItemId,
      dateFrom,
      dateTo,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('export.xlsx')
  async exportExcel(
    @Query('folio') folio: string | undefined,
    @Query('movementType') movementType: string | undefined,
    @Query('warehouseId') warehouseId: string | undefined,
    @Query('departmentId') departmentId: string | undefined,
    @Query('employeeName') employeeName: string | undefined,
    @Query('consumableItemId') consumableItemId: string | undefined,
    @Query('dateFrom') dateFrom: string | undefined,
    @Query('dateTo') dateTo: string | undefined,
    @Res() res: Response,
  ) {
    const file = await this.consumableMovementsService.exportExcel({
      folio,
      movementType,
      warehouseId,
      departmentId,
      employeeName,
      consumableItemId,
      dateFrom,
      dateTo,
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="consumable-movements.xlsx"',
    );

    res.send(file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.consumableMovementsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(
    @Body() createConsumableMovementDto: CreateConsumableMovementDto,
    @Req() req: Request,
  ) {
    const user = req.user as { userId: string };

    return this.consumableMovementsService.create(
      createConsumableMovementDto,
      user.userId,
    );
  }
}