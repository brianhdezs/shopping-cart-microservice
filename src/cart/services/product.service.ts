import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { IProductService } from '../interfaces/product.service.interface';
import { ProductDto } from '../dto/product.dto';
import { ResponseDto } from '../dto/response.dto';

@Injectable()
export class ProductService implements IProductService {
  private readonly logger = new Logger(ProductService.name);
  private readonly productApiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.productApiUrl = this.configService.get<string>('PRODUCT_API_URL') || 'http://localhost:3003';
  }

  async getProducts(): Promise<ProductDto[]> {
    try {
      this.logger.log('Getting all products from Product microservice');
      
      const response = await firstValueFrom(
        this.httpService.get<ResponseDto<ProductDto[]>>(`${this.productApiUrl}/api/product`)
      );

      if (response.data && response.data.isSuccess && response.data.result) {
        this.logger.log(`Retrieved ${response.data.result.length} products successfully`);
        return response.data.result;
      }

      this.logger.warn('No products found or invalid response');
      return [];
    } catch (error) {
      this.logger.error('Error getting products from Product microservice', error);
      return [];
    }
  }
}