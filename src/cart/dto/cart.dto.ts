import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';
import { CartHeaderDto } from './cart-header.dto';
import { CartDetailsDto } from './cart-details.dto';

export class CartDto {
  @ApiProperty({ type: CartHeaderDto })
  @ValidateNested()
  @Type(() => CartHeaderDto)
  cartHeader: CartHeaderDto = new CartHeaderDto();

  @ApiProperty({ type: [CartDetailsDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartDetailsDto)
  cartDetailsDtos: CartDetailsDto[] = [];
}