import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Brand } from '../entities/brand.entity';
import { CreateBrandDto, UpdateBrandDto } from '../dtos/brand.dtos';

@Injectable()
export class BrandService {
  constructor(@InjectRepository(Brand) private brandRepo: Repository<Brand>) {}

  findAll() {
    return this.brandRepo.find();
  }

  async findOne(id: number) {
    const brand = await this.brandRepo.findOne(id);
    if (!brand) {
      throw new NotFoundException(`Brand #${id} not found`);
    }
    return brand;
  }

  create(payload: CreateBrandDto) {
    const newBrand = this.brandRepo.create(payload);
    try {
      this.brandRepo.save(newBrand);
    } catch (err) {
      throw new BadRequestException(`Brand name exists`);
    }
    return newBrand;
  }

  async update(id: number, payload: UpdateBrandDto) {
    const brand = await this.brandRepo.findOne(id);
    if (brand) {
      throw new NotFoundException(`Brand #${id} not found`);
    }
    this.brandRepo.merge(brand, payload);
    return this.brandRepo.save(brand);
  }

  async delete(id: number) {
    const brand = await this.brandRepo.findOne(id);
    if (!brand) {
      throw new NotFoundException(`Brand #${id} not found`);
    }
    this.brandRepo.delete(id);
    return brand;
  }
}
