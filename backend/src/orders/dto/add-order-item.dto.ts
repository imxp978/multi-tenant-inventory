import { Type } from 'class-transformer';
import { IsNumber, IsPositive } from 'class-validator';

export class AddOrderItemDto {
  @IsNumber()
  variantId: number;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @Type(() => Number)
  unitPrice: number;
}
