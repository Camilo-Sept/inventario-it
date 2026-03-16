import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDeviceAssignmentDto {
  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  @IsString()
  @IsNotEmpty()
  assignedToName!: string;

  @IsString()
  @IsNotEmpty()
  warehouseId!: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsString()
  @IsNotEmpty()
  @IsDateString()
  assignedAt!: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  deliveryNotes?: string;

  @IsOptional()
  @IsString()
  devicePhotoPath?: string;

  @IsOptional()
  @IsString()
  deliveryDocumentPath?: string;

  @IsOptional()
  @IsString()
  policyDocumentPath?: string;

  @IsOptional()
  @IsString()
  signaturePath?: string;
}