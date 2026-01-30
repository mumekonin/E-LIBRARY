import { Type } from "class-transformer";
import { IsOptional, IsString } from "class-validator";

export class CreateBookDto {
  @IsString()
  @Type(() => String)
  title: string;
  @IsOptional()
  @IsString()
  author?: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsString()
  category?: string;
}
export class CreateCategoryDto{
  @IsString()
  name:string;
  @IsOptional()
  @IsString()
  description?:string;
}