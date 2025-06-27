import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CartHeader } from './cart-header.entity';

@Entity('cart_details')
export class CartDetails {
  @PrimaryGeneratedColumn()
  cartDetailsId: number;

  @Column()
  cartHeaderId: number;

  @Column()
  productId: number;

  @Column()
  count: number;

  @ManyToOne(() => CartHeader, cartHeader => cartHeader.cartDetails)
  @JoinColumn({ name: 'cartHeaderId' })
  cartHeader: CartHeader;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}