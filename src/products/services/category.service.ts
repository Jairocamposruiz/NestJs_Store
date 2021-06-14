import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from '../entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from '../dtos/category.dtos';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
  ) {}

  findAll() {
    return this.categoryRepo.find();
  }

  async findOne(id: number) {
    const category = await this.categoryRepo.findOne(id, {
      relations: ['products'],
    });
    if (!category) {
      throw new NotFoundException(`Category #${id} not found`);
    }
    return category;
  }

  async create(payload: CreateCategoryDto) {
    const newCategory = this.categoryRepo.create(payload);
    try {
      this.categoryRepo.save(newCategory);
    } catch (err) {
      throw new BadRequestException(`Category name exists`);
    }
    return newCategory;
  }

  async update(id: number, payload: UpdateCategoryDto) {
    const category = await this.categoryRepo.findOne(id);
    if (!category) {
      throw new NotFoundException(`Category #${id} not found`);
    }
    this.categoryRepo.merge(category, payload);
    return this.categoryRepo.save(category);
  }

  async delete(id: number) {
    const category = await this.categoryRepo.findOne(id);
    if (!category) {
      return new NotFoundException(`Category #${id} not found`);
    }
  }
}
