import {
  IsNumber,
  IsPositive,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePurchaseDto {
  @IsNumber()
  variantId: number;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @Type(() => Number)
  unitCost: number;

  @IsDateString()
  purchaseDate: string;

  @IsString()
  @IsOptional()
  note?: string;
}
