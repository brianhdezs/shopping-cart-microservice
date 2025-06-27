import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEmail } from 'class-validator';

export class CartHeaderDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  cartHeaderId?: number;

  @ApiProperty({ example: 'user123' })
  @IsString()
  userId: string = '';

  @ApiProperty({ example: 'DESCUENTO10', required: false })
  @IsOptional()
  @IsString()
  couponCode?: string = '';

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  discount?: number = 0;

  @ApiProperty({ example: 199.99, required: false })
  @IsOptional()
  @IsNumber()
  cartTotal?: number = 0;

  @ApiProperty({ example: 'Juan Pérez', required: false })
  @IsOptional()
  @IsString()
  name?: string = '';

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string = '';

  @ApiProperty({ example: 'juan@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string = '';
}