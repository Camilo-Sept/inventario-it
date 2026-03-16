import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateConsumableMovementItemDto } from './create-consumable-movement-item.dto';

export class CreateConsumableMovementDto {
  @IsString()
  @IsIn(['ENTRY', 'EXIT'])
  movementType!: string;

  @IsString()
  @IsNotEmpty()
  warehouseId!: string;

  @IsString()
  @IsNotEmpty()
  departmentId!: string;

  @IsString()
  @IsNotEmpty()
  employeeName!: string;

  @IsString()
  @IsNotEmpty()
  deliveredByName!: string;

  @IsDateString()
  movementDate!: string;

  @IsString()
  @IsNotEmpty()
  signaturePath!: string;

  @IsString()
  @IsNotEmpty()
  documentPath!: string;

  @IsString()
  @IsNotEmpty()
  notes!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateConsumableMovementItemDto)
  items!: CreateConsumableMovementItemDto[];
}