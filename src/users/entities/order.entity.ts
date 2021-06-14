import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

import { User } from './user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  date: Date;
  user: User;
  products: Product[];
}
