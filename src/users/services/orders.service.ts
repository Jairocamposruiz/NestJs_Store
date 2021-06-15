import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Order } from '../entities/order.entity';
import { Customer } from '../entities/custormer.entity';
import { CreateOrderDto, UpdateOrderDto } from '../dtos/order.dtos';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
  ) {}

  findAll() {
    return this.orderRepo.find();
  }

  async findOne(id: number) {
    const order = await this.orderRepo.findOne(id, {
      relations: ['items', 'customer', 'items.product'],
    });
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    return order;
  }

  async create(payload: CreateOrderDto) {
    const order = new Order();
    const customer = await this.customerRepo.findOne(payload.customerId);
    if (!customer) {
      throw new NotFoundException(`Client #${payload.customerId} not found`);
    }
    order.customer = customer;
    return this.orderRepo.save(order);
  }

  async update(id: number, payload: UpdateOrderDto) {
    const order = await this.orderRepo.findOne(id);
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    if (payload.customerId) {
      const customer = await this.customerRepo.findOne(payload.customerId);
      if (!customer) {
        throw new NotFoundException(
          `Customer #${payload.customerId} not found`,
        );
      }
      order.customer = customer;
    }
    return this.orderRepo.save(order);
  }

  async delete(id: number) {
    const order = await this.orderRepo.findOne(id);
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    return this.orderRepo.delete(id);
  }
}
