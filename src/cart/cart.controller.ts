import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  ParseIntPipe,
  UseGuards,
  Logger
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CartDto } from './dto/cart.dto';
import { ResponseDto } from './dto/response.dto';
import { RemoveCartDto } from './dto/remove-cart.dto';

// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Shopping Cart')
@Controller('api/cartapi')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
export class CartController {
  private readonly logger = new Logger(CartController.name);

  constructor(private readonly cartService: CartService) {}

  @Get('GetCart/:userId')
  @ApiOperation({ summary: 'Get cart by user ID' })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully' })
  async getCart(@Param('userId') userId: string): Promise<ResponseDto<CartDto>> {
    return await this.cartService.getCart(userId);
  }

  @Post('CartUpsert')
  @ApiOperation({ summary: 'Create or update cart item' })
  @ApiResponse({ status: 200, description: 'Cart updated successfully' })
  async cartUpsert(@Body() cartDto: CartDto): Promise<ResponseDto<CartDto>> {
    return await this.cartService.cartUpsert(cartDto);
  }
@Post('RemoveCart')
@ApiOperation({ summary: 'Remove item from cart' })
@ApiResponse({ status: 200, description: 'Item removed successfully' })
async removeFromCart(@Body() removeCartDto: RemoveCartDto): Promise<ResponseDto<boolean>> {
  return await this.cartService.removeFromCart(removeCartDto.cartDetailsId);
}

  @Post('ApplyCoupon')
  @ApiOperation({ summary: 'Apply coupon to cart' })
  @ApiResponse({ status: 200, description: 'Coupon applied successfully' })
  async applyCoupon(@Body() cartDto: CartDto): Promise<ResponseDto<boolean>> {
    return await this.cartService.applyCoupon(cartDto);
  }

  @Post('RemoveCoupon')
  @ApiOperation({ summary: 'Remove coupon from cart' })
  @ApiResponse({ status: 200, description: 'Coupon removed successfully' })
  async removeCoupon(@Body() cartDto: CartDto): Promise<ResponseDto<boolean>> {
    return await this.cartService.removeCoupon(cartDto);
  }

  @Get('GetCartCount/:userId')
  @ApiOperation({ summary: 'Get cart items count by user ID' })
  @ApiResponse({ status: 200, description: 'Cart count retrieved successfully' })
  async getCartCount(@Param('userId') userId: string): Promise<ResponseDto<number>> {
    return await this.cartService.getCartCount(userId);
  }
}