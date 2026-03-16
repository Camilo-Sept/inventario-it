import { Module } from '@nestjs/common';
import { ConsumableMovementsController } from './consumable-movements.controller';
import { ConsumableMovementsService } from './consumable-movements.service';

@Module({
  controllers: [ConsumableMovementsController],
  providers: [ConsumableMovementsService],
})
export class ConsumableMovementsModule {}