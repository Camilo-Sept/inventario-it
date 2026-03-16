import { Module } from '@nestjs/common';
import { DeviceAssignmentsController } from './device-assignments.controller';
import { DeviceAssignmentsService } from './device-assignments.service';

@Module({
  controllers: [DeviceAssignmentsController],
  providers: [DeviceAssignmentsService],
})
export class DeviceAssignmentsModule {}