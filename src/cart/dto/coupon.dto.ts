import { ApiProperty } from '@nestjs/swagger';

export class CouponDto {
  @ApiProperty({ example: 1 })
  couponId: number;

  @ApiProperty({ example: 'DESCUENTO10' })
  couponCode: string = '';

  @ApiProperty({ example: 10 })
  discountAmount: number;

  @ApiProperty({ example: 50 })
  minAmount: number;
}