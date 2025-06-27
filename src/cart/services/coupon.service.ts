import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ICouponService } from '../interfaces/coupon.service.interface';
import { CouponDto } from '../dto/coupon.dto';
import { ResponseDto } from '../dto/response.dto';

@Injectable()
export class CouponService implements ICouponService {
  private readonly logger = new Logger(CouponService.name);
  private readonly couponApiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.couponApiUrl = this.configService.get<string>('COUPON_API_URL') || 'http://localhost:3004';
  }

  async getCoupon(couponCode: string): Promise<CouponDto | null> {
    try {
      this.logger.log(`Getting coupon: ${couponCode}`);
      
      if (!couponCode) {
        this.logger.warn('Coupon code is null or empty');
        return null;
      }

      const response = await firstValueFrom(
        this.httpService.get<ResponseDto<CouponDto>>(`${this.couponApiUrl}/api/cupon/GetByCode/${couponCode}`)
      );

      if (response.data && response.data.isSuccess && response.data.result) {
        this.logger.log(`Coupon ${couponCode} retrieved successfully`);
        return response.data.result;
      }

      this.logger.warn(`Coupon ${couponCode} not found or invalid`);
      return null;
    } catch (error) {
      this.logger.error(`Error getting coupon: ${couponCode}`, error);
      return null;
    }
  }
}