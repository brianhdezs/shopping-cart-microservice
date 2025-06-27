import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartHeader } from './entities/cart-header.entity';
import { CartDetails } from './entities/cart-details.entity';
import { CartDto } from './dto/cart.dto';
import { CartHeaderDto } from './dto/cart-header.dto';
import { CartDetailsDto } from './dto/cart-details.dto';
import { ResponseDto } from './dto/response.dto';
import { ProductService } from './services/product.service';
import { CouponService } from './services/coupon.service';
import { ProductDto } from './dto/product.dto';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(CartHeader)
    private readonly cartHeaderRepository: Repository<CartHeader>,
    @InjectRepository(CartDetails)
    private readonly cartDetailsRepository: Repository<CartDetails>,
    private readonly productService: ProductService,
    private readonly couponService: CouponService,
  ) {}

  async getCart(userId: string): Promise<ResponseDto<CartDto>> {
    try {
      this.logger.log(`Getting cart for user: ${userId}`);

      const cartHeader = await this.cartHeaderRepository.findOne({
        where: { userId },
        relations: ['cartDetails'],
      });

      if (!cartHeader) {
        this.logger.log(`No cart found for user: ${userId}`);
        return ResponseDto.success({
          cartHeader: { 
            userId, 
            cartTotal: 0, 
            discount: 0,
            cartHeaderId: 0,
            couponCode: '',
            name: '',
            phone: '',
            email: ''
          } as CartHeaderDto,
          cartDetailsDtos: []
        } as CartDto);
      }

      const cart: CartDto = {
        cartHeader: this.mapCartHeaderToDto(cartHeader),
        cartDetailsDtos: cartHeader.cartDetails.map(detail => this.mapCartDetailsToDto(detail))
      };

      // Obtener información de productos
      const products = await this.productService.getProducts();
      let cartTotal = 0;

      for (const item of cart.cartDetailsDtos) {
        const product = products.find(p => p.productId === item.productId);
        
        if (product) {
          item.productDto = product;
          cartTotal += item.count * product.price;
        } else {
          this.logger.warn(`Product not found: ${item.productId} for user: ${userId}`);
          item.productDto = {
            productId: item.productId,
            name: 'Producto no encontrado',
            price: 0,
            description: 'Este producto ya no está disponible',
            categoryName: 'N/A',
            imageUrl: ''
          } as ProductDto;
        }
      }

      cart.cartHeader.cartTotal = cartTotal;

      // Aplicar cupón si existe
      if (cart.cartHeader.couponCode) {
        const coupon = await this.couponService.getCoupon(cart.cartHeader.couponCode);
        if (coupon && cartTotal > coupon.minAmount) {
          cart.cartHeader.cartTotal -= coupon.discountAmount;
          cart.cartHeader.discount = coupon.discountAmount;
          this.logger.log(`Applied coupon ${cart.cartHeader.couponCode} with discount ${coupon.discountAmount}`);
        }
      }

      this.logger.log(`Cart retrieved successfully for user: ${userId} with ${cart.cartDetailsDtos.length} items`);
      return ResponseDto.success(cart);
    } catch (error) {
      this.logger.error(`Error getting cart for user: ${userId}`, error);
      return ResponseDto.error(error.message);
    }
  }

  async cartUpsert(cartDto: CartDto): Promise<ResponseDto<CartDto>> {
    try {
      this.logger.log(`Upserting cart for user: ${cartDto.cartHeader.userId}`);

      if (!cartDto.cartHeader.userId) {
        return ResponseDto.error('ID de usuario requerido');
      }

      let cartHeader = await this.cartHeaderRepository.findOne({
        where: { userId: cartDto.cartHeader.userId }
      });

      if (!cartHeader) {
        // Crear nuevo carrito
        cartHeader = this.cartHeaderRepository.create({
          userId: cartDto.cartHeader.userId,
          couponCode: cartDto.cartHeader.couponCode || '',
          name: cartDto.cartHeader.name || '',
          phone: cartDto.cartHeader.phone || '',
          email: cartDto.cartHeader.email || ''
        });
        await this.cartHeaderRepository.save(cartHeader);

        // Agregar primer item
        const cartDetails = this.cartDetailsRepository.create({
          cartHeaderId: cartHeader.cartHeaderId,
          productId: cartDto.cartDetailsDtos[0].productId,
          count: cartDto.cartDetailsDtos[0].count
        });
        await this.cartDetailsRepository.save(cartDetails);

        this.logger.log(`Created new cart for user: ${cartDto.cartHeader.userId}`);
      } else {
        // Verificar si el producto ya existe en el carrito
        const existingCartDetail = await this.cartDetailsRepository.findOne({
          where: {
            cartHeaderId: cartHeader.cartHeaderId,
            productId: cartDto.cartDetailsDtos[0].productId
          }
        });

        if (!existingCartDetail) {
          // Agregar nuevo producto al carrito existente
          const cartDetails = this.cartDetailsRepository.create({
            cartHeaderId: cartHeader.cartHeaderId,
            productId: cartDto.cartDetailsDtos[0].productId,
            count: cartDto.cartDetailsDtos[0].count
          });
          await this.cartDetailsRepository.save(cartDetails);
          this.logger.log(`Added product to existing cart for user: ${cartDto.cartHeader.userId}`);
        } else {
          // Actualizar cantidad del producto existente
          existingCartDetail.count += cartDto.cartDetailsDtos[0].count;
          await this.cartDetailsRepository.save(existingCartDetail);
          this.logger.log(`Updated cart quantity for user: ${cartDto.cartHeader.userId}`);
        }
      }

      return ResponseDto.success(cartDto);
    } catch (error) {
      this.logger.error(`Error upserting cart for user: ${cartDto?.cartHeader?.userId}`, error);
      return ResponseDto.error(error.message);
    }
  }

  async removeFromCart(cartDetailsId: number): Promise<ResponseDto<boolean>> {
    try {
      this.logger.log(`Removing cart item: ${cartDetailsId}`);

      const cartDetails = await this.cartDetailsRepository.findOne({
        where: { cartDetailsId }
      });

      if (!cartDetails) {
        return ResponseDto.error('Elemento del carrito no encontrado');
      }

      const totalItems = await this.cartDetailsRepository.count({
        where: { cartHeaderId: cartDetails.cartHeaderId }
      });

      await this.cartDetailsRepository.remove(cartDetails);

      // Si era el último item, eliminar el header también
      if (totalItems === 1) {
        const cartHeader = await this.cartHeaderRepository.findOne({
          where: { cartHeaderId: cartDetails.cartHeaderId }
        });
        if (cartHeader) {
          await this.cartHeaderRepository.remove(cartHeader);
          this.logger.log(`Removed entire cart for CartHeaderId: ${cartDetails.cartHeaderId}`);
        }
      }

      this.logger.log(`Cart item removed successfully: ${cartDetailsId}`);
      return ResponseDto.success(true);
    } catch (error) {
      this.logger.error(`Error removing cart item: ${cartDetailsId}`, error);
      return ResponseDto.error(error.message);
    }
  }

  async applyCoupon(cartDto: CartDto): Promise<ResponseDto<boolean>> {
    try {
      this.logger.log(`Applying coupon ${cartDto.cartHeader.couponCode} for user: ${cartDto.cartHeader.userId}`);

      if (!cartDto.cartHeader.couponCode) {
        return ResponseDto.error('Código de cupón requerido');
      }

      const cartHeader = await this.cartHeaderRepository.findOne({
        where: { userId: cartDto.cartHeader.userId }
      });

      if (!cartHeader) {
        return ResponseDto.error('Carrito no encontrado');
      }

      cartHeader.couponCode = cartDto.cartHeader.couponCode;
      await this.cartHeaderRepository.save(cartHeader);

      this.logger.log(`Coupon applied successfully for user: ${cartDto.cartHeader.userId}`);
      return ResponseDto.success(true);
    } catch (error) {
      this.logger.error(`Error applying coupon for user: ${cartDto?.cartHeader?.userId}`, error);
      return ResponseDto.error(error.message);
    }
  }

  async removeCoupon(cartDto: CartDto): Promise<ResponseDto<boolean>> {
    try {
      this.logger.log(`Removing coupon for user: ${cartDto.cartHeader.userId}`);

      const cartHeader = await this.cartHeaderRepository.findOne({
        where: { userId: cartDto.cartHeader.userId }
      });

      if (!cartHeader) {
        return ResponseDto.error('Carrito no encontrado');
      }

      cartHeader.couponCode = '';
      await this.cartHeaderRepository.save(cartHeader);

      this.logger.log(`Coupon removed successfully for user: ${cartDto.cartHeader.userId}`);
      return ResponseDto.success(true);
    } catch (error) {
      this.logger.error(`Error removing coupon for user: ${cartDto?.cartHeader?.userId}`, error);
      return ResponseDto.error(error.message);
    }
  }

  async getCartCount(userId: string): Promise<ResponseDto<number>> {
    try {
      this.logger.log(`Getting cart count for user: ${userId}`);

      const cartHeader = await this.cartHeaderRepository.findOne({
        where: { userId }
      });

      if (!cartHeader) {
        return ResponseDto.success(0);
      }

      const count = await this.cartDetailsRepository.count({
        where: { cartHeaderId: cartHeader.cartHeaderId }
      });

      this.logger.log(`Cart count for user ${userId}: ${count}`);
      return ResponseDto.success(count);
    } catch (error) {
      this.logger.error(`Error getting cart count for user: ${userId}`, error);
      return ResponseDto.error(error.message);
    }
  }

  private mapCartHeaderToDto(cartHeader: CartHeader): CartHeaderDto {
  return {
    cartHeaderId: cartHeader.cartHeaderId,
    userId: cartHeader.userId,
    couponCode: cartHeader.couponCode || '',
    discount: cartHeader.discount || 0,
    cartTotal: cartHeader.cartTotal || 0,
    name: cartHeader.name || '',
    phone: cartHeader.phone || '',
    email: cartHeader.email || '',
  };
}

  private mapCartDetailsToDto(cartDetails: CartDetails): CartDetailsDto {
    return {
      cartDetailsId: cartDetails.cartDetailsId,
      cartHeaderId: cartDetails.cartHeaderId,
      productId: cartDetails.productId,
      count: cartDetails.count,
    };
  }
}