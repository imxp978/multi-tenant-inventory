import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateVariantDto {
  @IsString()
  @IsOptional()
  color?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  costPrice?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  stock?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minStock?: number;
}
