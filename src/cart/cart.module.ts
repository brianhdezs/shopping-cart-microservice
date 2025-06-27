import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { ProductService } from './services/product.service';
import { CouponService } from './services/coupon.service';
import { CartHeader } from './entities/cart-header.entity';
import { CartDetails } from './entities/cart-details.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartHeader, CartDetails]),
    HttpModule,
    ConfigModule,
  ],
  controllers: [CartController],
  providers: [CartService, ProductService, CouponService],
  exports: [CartService],
})
export class CartModule {}