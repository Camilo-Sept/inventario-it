import { Module } from '@nestjs/common';
import { SecurityModule } from '../security/security.module';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';

@Module({
  imports: [SecurityModule],
  providers: [DevicesService],
  controllers: [DevicesController],
})
export class DevicesModule {}
