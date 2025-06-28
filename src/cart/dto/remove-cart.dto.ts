import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class RemoveCartDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsPositive()
  cartDetailsId: number;
}