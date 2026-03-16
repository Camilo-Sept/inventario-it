import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateConsumableItemDto } from './dto/create-consumable-item.dto';
import { UpdateConsumableItemDto } from './dto/update-consumable-item.dto';
import { ConsumableItemsService } from './consumable-items.service';

@Controller('consumable-items')
export class ConsumableItemsController {
  constructor(
    private readonly consumableItemsService: ConsumableItemsService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.consumableItemsService.findAll({
      search,
      isActive,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('export.xlsx')
  async exportExcel(
    @Query('search') search: string | undefined,
    @Query('isActive') isActive: string | undefined,
    @Res() res: Response,
  ) {
    const file = await this.consumableItemsService.exportExcel({
      search,
      isActive,
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="consumable-items.xlsx"',
    );

    res.send(file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get(':id/movements')
  findMovements(@Param('id') id: string) {
    return this.consumableItemsService.findMovements(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.consumableItemsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() createConsumableItemDto: CreateConsumableItemDto) {
    return this.consumableItemsService.create(createConsumableItemDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateConsumableItemDto: UpdateConsumableItemDto,
  ) {
    return this.consumableItemsService.update(id, updateConsumableItemDto);
  }
}