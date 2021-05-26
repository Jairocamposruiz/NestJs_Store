import { Injectable, NotFoundException } from '@nestjs/common';

import { Category } from '../entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from '../dtos/category.dtos';

@Injectable()
export class CategoryService {
  private counterId = 1;

  private categories: Category[] = [
    {
      id: 1,
      name: 'Category 1',
    },
  ];

  findAll() {
    return this.categories;
  }

  findOne(id: number) {
    const category = this.categories.find((item) => item.id === id);
    if (!category) {
      throw new NotFoundException(`Category #${id} not found`);
    }
    return category;
  }

  create(payload: CreateCategoryDto) {
    this.counterId++;
    const newCategory = {
      id: this.counterId,
      ...payload,
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  update(id: number, payload: UpdateCategoryDto) {
    const index = this.categories.findIndex((item) => item.id === id);
    if (!this.categories[index]) {
      throw new NotFoundException(`Category #${id} not found`);
    }
    this.categories[index] = {
      ...this.categories[index],
      ...payload,
    };
    return this.categories[index];
  }

  delete(id: number) {
    const index = this.categories.findIndex((item) => item.id === id);
    if (!this.categories[index]) {
      throw new NotFoundException(`Category #${id} not found`);
    }
    const categoryDeleted = this.categories.splice(index, 1);
    return categoryDeleted;
  }
}
