import { ProductDto } from '../dto/product.dto';

export interface IProductService {
  getProducts(): Promise<ProductDto[]>;
}