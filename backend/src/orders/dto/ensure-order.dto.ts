import { IsDateString } from 'class-validator';

export class EnsureOrderDto {
  @IsDateString()
  date: string; // YYYY-MM-DD
}
