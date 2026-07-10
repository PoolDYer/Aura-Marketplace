import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class AddItemDto {
  @IsString()
  @IsNotEmpty()
  publicacionId: string;

  @IsInt()
  @Min(1)
  cantidad: number;
}

export class UpdateItemDto {
  @IsInt()
  @Min(1)
  cantidad: number;
}
