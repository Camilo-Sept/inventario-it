import { Module } from '@nestjs/common';
import { ConsumableItemsController } from './consumable-items.controller';
import { ConsumableItemsService } from './consumable-items.service';

@Module({
  controllers: [ConsumableItemsController],
  providers: [ConsumableItemsService],
})
export class ConsumableItemsModule {}