import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CartDetails } from './cart-details.entity';

@Entity('cart_headers')
export class CartHeader {
  @PrimaryGeneratedColumn()
  cartHeaderId: number;

  @Column()
  userId: string;

  @Column({ default: '' })
  couponCode: string;

  @Column({ default: '' })
  name: string;

  @Column({ default: '' })
  phone: string;

  @Column({ default: '' })
  email: string;

  @OneToMany(() => CartDetails, cartDetails => cartDetails.cartHeader, { cascade: true })
  cartDetails: CartDetails[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Campos calculados (no se almacenan en BD)
  discount?: number;
  cartTotal?: number;
}