import { Injectable, NotFoundException } from '@nestjs/common';

import { Brand } from '../entities/brand.entity';
import { CreateBrandDto, UpdateBrandDto } from '../dtos/brand.dtos';

@Injectable()
export class BrandService {
  private counterId = 1;
  private brands: Brand[] = [
    {
      id: 1,
      name: 'Brand 1',
      image: 'https://i.imgur.com/U4iGx1j.jpeg',
    },
  ];

  findAll() {
    return this.brands;
  }

  findOne(id: number) {
    const brand = this.brands.find((item) => item.id === id);
    if (!brand) {
      throw new NotFoundException(`Brand #${id} not found`);
    }
    return brand;
  }

  create(payload: CreateBrandDto) {
    this.counterId++;
    const newBrand = {
      id: this.counterId,
      ...payload,
    };
    this.brands.push(newBrand);
    return newBrand;
  }

  update(id: number, payload: UpdateBrandDto) {
    const index = this.brands.findIndex((item) => item.id === id);
    if (!this.brands[index]) {
      throw new NotFoundException(`Brand #${id} not found`);
    }
    this.brands[index] = {
      ...this.brands[index],
      ...payload,
    };
    return this.brands[index];
  }

  delete(id: number) {
    const index = this.brands.findIndex((item) => item.id === id);
    if (!this.brands[index]) {
      throw new NotFoundException(`Brand #${id} not found`);
    }
    const brandDeleted = this.brands.splice(index, 1);
    return brandDeleted;
  }
}
