import { ApiProperty } from '@nestjs/swagger';

export class ProductDto {
  @ApiProperty({ example: 1 })
  productId: number;

  @ApiProperty({ example: 'Producto ejemplo' })
  name: string = '';

  @ApiProperty({ example: 99.99 })
  price: number;

  @ApiProperty({ example: 'Descripción del producto' })
  description: string = '';

  @ApiProperty({ example: 'Categoría' })
  categoryName: string = '';

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  imageUrl: string = '';
}