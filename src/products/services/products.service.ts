import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from '../entities/category.entity';
import { Brand } from '../entities/brand.entity';
import { Product } from '../entities/product.entity';
import { CreateProductDto, UpdateProductDto } from '../dtos/products.dtos';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Brand) private brandRepo: Repository<Brand>,
  ) {}

  findAll() {
    return this.productRepo.find({ relations: ['brand', 'categories'] });
  }

  async findOne(id: number) {
    const product = await this.productRepo.findOne(id, {
      relations: ['brand', 'categories'],
    });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  async create(payload: CreateProductDto) {
    const newProduct = this.productRepo.create(payload); //Crea la instancia
    if (payload.brandId) {
      const brand = await this.brandRepo.findOne(payload.brandId);
      newProduct.brand = brand;
    }
    if (payload.categoriesIds) {
      const categories = await this.categoryRepo.findByIds(
        payload.categoriesIds,
      );
      newProduct.categories = categories;
    }
    try {
      await this.productRepo.save(newProduct);
    } catch (err) {
      throw new BadRequestException(`Product name exists`);
    }
    return newProduct; //Guarda en la base de datos
  }

  async update(id: number, payload: UpdateProductDto) {
    const product = await this.productRepo.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    if (payload.brandId) {
      const brand = await this.brandRepo.findOne(payload.brandId);
      product.brand = brand;
    }
    if (payload.categoriesIds) {
      const categories = await this.categoryRepo.findByIds(
        payload.categoriesIds,
      );
      product.categories = categories;
    }
    this.productRepo.merge(product, payload); //Coje el producto y le añade los cambios
    return this.productRepo.save(product);
  }

  async removeCategoryByProduct(productId: number, categoryId: number) {
    const product = await this.productRepo.findOne(productId, {
      relations: ['categories', 'brand'],
    });
    if (!product) {
      throw new NotFoundException(`Product #${productId} not found`);
    }
    product.categories = product.categories.filter(
      (item) => item.id != categoryId,
    );
    return this.productRepo.save(product);
  }

  async addCategoryToProduct(productId: number, categoryId: number) {
    const product = await this.productRepo.findOne(productId, {
      relations: ['categories', 'brand'],
    });
    if (!product) {
      throw new NotFoundException(`Product #${productId} not found`);
    }
    const category = await this.categoryRepo.findOne(categoryId);
    if (!category) {
      throw new NotFoundException(`Category #${categoryId} not found`);
    }
    if (!product.categories.find((item) => item.id == categoryId)) {
      product.categories.push(category);
    }
    return this.productRepo.save(product);
  }

  async delete(id: number) {
    const product = await this.productRepo.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    this.productRepo.delete(id);
    return product;
  }
}
