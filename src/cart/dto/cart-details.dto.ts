import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsOptional } from 'class-validator';
import { CartHeaderDto } from './cart-header.dto';
import { ProductDto } from './product.dto';

export class CartDetailsDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  cartDetailsId?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  cartHeaderId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  cartHeader?: CartHeaderDto;

  @ApiProperty({ example: 1 })
  @IsNumber()
  productId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  productDto?: ProductDto;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @IsPositive()
  count: number;
}