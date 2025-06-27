import { CouponDto } from '../dto/coupon.dto';

export interface ICouponService {
  getCoupon(couponCode: string): Promise<CouponDto | null>;
}