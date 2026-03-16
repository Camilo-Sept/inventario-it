import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateDeviceDto {
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @IsOptional()
  @IsString()
  deviceTypeId?: string;

  @IsOptional()
  @IsString()
  brandId?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  currentResponsibleName?: string | null;

  @IsOptional()
  @IsString()
  departmentId?: string | null;

  @IsOptional()
  @IsString()
  simNumber?: string | null;

  @IsOptional()
  @IsString()
  phoneNumber?: string | null;

  @IsOptional()
  @IsString()
  invoiceNumber?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  partNumber?: string | null;

  @IsOptional()
  @IsString()
  model?: string | null;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string | null;

  @IsOptional()
  @IsString()
  wifiMac?: string | null;

  @IsOptional()
  @IsString()
  bluetoothMac?: string | null;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  imei?: string | null;

  @IsOptional()
  @IsString()
  iccid?: string | null;

  @IsOptional()
  @IsString()
  localPasswordEncrypted?: string | null;

  @IsOptional()
  @IsString()
  gmailAccount?: string | null;

  @IsOptional()
  @IsString()
  gmailPasswordEncrypted?: string | null;

  @IsOptional()
  @IsString()
  computerName?: string | null;

  @IsOptional()
  @IsString()
  teamviewerId?: string | null;

  @IsOptional()
  @IsString()
  qrCode?: string | null;

  @IsOptional()
  @IsString()
  barcode?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
}