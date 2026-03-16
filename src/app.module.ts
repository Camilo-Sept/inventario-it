import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BrandsModule } from './brands/brands.module';
import { ConsumableItemsModule } from './consumable-items/consumable-items.module';
import { ConsumableMovementsModule } from './consumable-movements/consumable-movements.module';
import { DepartmentsModule } from './departments/departments.module';
import { DeviceAssignmentsModule } from './device-assignments/device-assignments.module';
import { DevicesModule } from './devices/devices.module';
import { DeviceTypesModule } from './device-types/device-types.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { WarehousesModule } from './warehouses/warehouses.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    DeviceTypesModule,
    BrandsModule,
    WarehousesModule,
    DepartmentsModule,
    DevicesModule,
    DeviceAssignmentsModule,
    ConsumableItemsModule,
    ConsumableMovementsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}