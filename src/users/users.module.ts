import { Module } from '@nestjs/common';

import { UsersController } from './controllers/users.controller';
import { CustomersController } from './controllers/customers.controller';

import { UsersService } from './services/users.service';
import { CustomersService } from './services/customers.service';

import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  controllers: [UsersController, CustomersController],
  providers: [CustomersService, UsersService],
})
export class UsersModule {}
