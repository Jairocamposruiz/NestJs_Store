import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderItem } from '../entities/order-item.entity';
import { Order } from '../entities/order.entity';
import { Product } from '../../products/entities/product.entity';
import {
  CreateOrderItemDto,
  UpdateOrderItemDto,
} from '../dtos/order-item.dtos';

@Injectable()
export class OrderItemService {
  constructor(
    @InjectRepository(OrderItem) private orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  findAll() {
    return this.orderItemRepo.find({ relations: ['product', 'order'] });
  }

  async findOne(id: number) {
    const item = await this.orderItemRepo.findOne(id, {
      relations: ['product', 'order'],
    });
    if (!item) {
      throw new NotFoundException(`OrderItem #${id} not found`);
    }
    return item;
  }

  async create(payload: CreateOrderItemDto) {
    const order = await this.orderRepo.findOne(payload.orderId);
    if (!order) {
      throw new NotFoundException(`Order #${payload.orderId} not found`);
    }
    const product = await this.productRepo.findOne(payload.productId);
    if (!product) {
      throw new NotFoundException(`Product #${payload.productId} not found`);
    }
    const item = new OrderItem();
    item.order = order;
    item.product = product;
    item.quantity = payload.quantity;
    return this.orderItemRepo.save(item);
  }

  async update(id: number, payload: UpdateOrderItemDto) {
    const item = await this.orderItemRepo.findOne(id);
    if (!item) {
      throw new NotFoundException(`OrderItem #${id} not found`);
    }
    if (payload.orderId) {
      const order = await this.orderRepo.findOne(payload.orderId);
      if (!order) {
        throw new NotFoundException(`Order #${payload.orderId} not found`);
      }
      item.order = order;
    }
    if (payload.productId) {
      const product = await this.productRepo.findOne(payload.productId);
      if (!product) {
        throw new NotFoundException(`Product #${payload.productId} not found`);
      }
      item.product = product;
    }
    if (payload.quantity) {
      item.quantity = payload.quantity;
    }
    return this.orderItemRepo.save(item);
  }

  async delete(id: number) {
    const item = await this.orderItemRepo.findOne(id);
    if (!item) {
      throw new NotFoundException(`OrderItem #${id} not found`);
    }
    return this.orderItemRepo.delete(id);
  }
}
