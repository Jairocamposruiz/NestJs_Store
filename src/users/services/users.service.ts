import { Injectable, NotFoundException } from '@nestjs/common';

import { User } from '../entities/user.entity';
import { Order } from '../entities/order.entity';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dtos';

import { ProductsService } from '../../products/services/products.service';

@Injectable()
export class UsersService {
  constructor(private readonly productService: ProductsService) {}

  private counterId = 1;

  private users: User[] = [
    {
      id: 1,
      password: '12345',
      email: 'correo@gmail.com',
      role: 'admin',
    },
  ];

  findAll() {
    return this.users;
  }

  findOne(id: number) {
    const user = this.users.find((item) => item.id === id);
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  create(payload: CreateUserDto) {
    this.counterId++;
    const newUser = {
      id: this.counterId,
      ...payload,
    };
    this.users.push(newUser);
    return newUser;
  }

  update(id: number, payload: UpdateUserDto) {
    const index = this.users.findIndex((item) => item.id === id);
    if (!this.users[index]) {
      throw new NotFoundException(`User #${id} not found`);
    }
    this.users[index] = {
      ...this.users[index],
      ...payload,
    };
    return this.users[index];
  }

  delete(id: number) {
    const index = this.users.findIndex((item) => item.id === id);
    if (!this.users[index]) {
      throw new NotFoundException(`User #${id} not found`);
    }
    const userDeleted = this.users.splice(index, 1);
    return userDeleted;
  }

  getOrdersByUser(id: number): Order {
    const user = this.findOne(id);
    return {
      date: new Date(),
      user,
      products: this.productService.findAll(),
    };
  }
}
