import { IsDateString, IsOptional, IsString } from 'class-validator';

export class ReturnDeviceAssignmentDto {
  @IsOptional()
  @IsDateString()
  returnedAt?: string;

  @IsOptional()
  @IsString()
  returnNotes?: string;
}