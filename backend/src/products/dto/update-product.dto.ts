import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  categoryId?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sellingPrice?: number;

  @IsString()
  @IsOptional()
  supplierUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
