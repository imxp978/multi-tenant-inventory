import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateCategoryDto {
  @IsString() @IsOptional()
  name?: string;

  @IsNumber() @IsOptional()
  sortOrder?: number;
}
