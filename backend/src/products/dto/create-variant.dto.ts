import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVariantDto {
  @IsString()
  @IsNotEmpty()
  color: string;

  @IsString()
  @IsOptional()
  variantSku?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  costPrice?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  stock?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minStock?: number;
}
