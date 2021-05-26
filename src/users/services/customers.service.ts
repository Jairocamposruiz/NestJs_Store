import { Injectable, NotFoundException } from '@nestjs/common';

import { Customer } from '../entities/custormer.entity';
import { CreateCustomerDto, UpdateCustomerDto } from '../dtos/customer.dtos';

@Injectable()
export class CustomersService {
  private counterId = 1;

  private customers: Customer[] = [
    {
      id: 1,
      name: 'Customer 1',
      lastName: 'LastName 1',
      phone: '3111111212',
    },
  ];

  findAll() {
    return this.customers;
  }

  findOne(id: number) {
    const customer = this.customers.find((item) => item.id === id);
    if (!customer) {
      throw new NotFoundException(`Customer #${id} not found`);
    }
    return customer;
  }

  create(payload: CreateCustomerDto) {
    this.counterId++;
    const newCustomer = {
      id: this.counterId,
      ...payload,
    };
    this.customers.push(newCustomer);
    return newCustomer;
  }

  update(id: number, payload: UpdateCustomerDto) {
    const index = this.customers.findIndex((item) => item.id === id);
    if (!this.customers[index]) {
      throw new NotFoundException(`Customer #${id} not found`);
    }
    this.customers[index] = {
      ...this.customers[index],
      ...payload,
    };
    return this.customers[index];
  }

  delete(id: number) {
    const index = this.customers.findIndex((item) => item.id === id);
    if (!this.customers[index]) {
      throw new NotFoundException(`Customer #${id} not found`);
    }
    const customerDeleted = this.customers.splice(index, 1);
    return customerDeleted;
  }
}
