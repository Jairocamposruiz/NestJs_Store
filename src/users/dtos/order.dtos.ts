import { IsMongoId, IsNotEmpty, IsDate, IsArray } from 'class-validator';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsMongoId()
  @ApiProperty()
  readonly customer: string;

  @IsDate()
  @IsNotEmpty()
  @ApiProperty()
  readonly date: Date;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty()
  readonly products: string[];
}

export class UpdateOrderDto extends PartialType(
  OmitType(CreateOrderDto, ['products']),
) {}

export class AddProductsToOrderDto {
  @IsArray()
  @IsNotEmpty()
  @ApiProperty()
  readonly productsIds: string[];
}
