import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dtos';

import { ProductsService } from '../../products/services/products.service';
import { CustomersService } from './customers.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly productService: ProductsService,
    private readonly customerService: CustomersService,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  findAll() {
    return this.userRepo.find({ relations: ['customer'] });
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne(id, { relations: ['customer'] });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  async create(payload: CreateUserDto) {
    const newUser = await this.userRepo.create(payload);
    const hashPassword = await bcrypt.hash(newUser.password, 10);
    newUser.password = hashPassword;
    if (payload.customerId) {
      const customer = await this.customerService.findOne(payload.customerId);
      newUser.customer = customer;
    }
    return this.userRepo.save(newUser);
  }

  async update(id: number, payload: UpdateUserDto) {
    const user = await this.userRepo.findOne(id);
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    this.userRepo.merge(user, payload);
    return this.userRepo.save(user);
  }

  async delete(id: number) {
    const user = await this.userRepo.findOne(id);
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    this.userRepo.delete(id);
    return user;
  }

  async getOrdersByUser(id: number) {
    const user = this.findOne(id);
    return {
      date: new Date(),
      user,
      products: await this.productService.findAll(),
    };
  }
}
