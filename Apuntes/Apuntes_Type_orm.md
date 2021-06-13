# Integración de una base de datos SQL al proyecto

## Creación del docker que contendrá la base de datos

En primer lugar y para probar en una base de datos de desarrollo creamos un archivo `docker-compose.yml` este archivo nos servirá para levantar imagenes de docker con los servicios que necesitemos.

Ejemplo de un docker compose con Postgres y PGAdmin:

```yml
version: '3.3'

services:
  postgres:
    image: postgres:13
    environment:
      - POSTGRES_DB=my_db
      - POSTGRES_USER=root
      - POSTGRES_PASSWORD=123456
    ports:
      - '5432:5432'
    volumes:
      - ./postgres_data:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4
    environment:
      - PGADMIN_DEFAULT_EMAIL=root@admin.com
      - PGADMIN_DEFAULT_PASSWORD=root
    ports:
      - '5050:80'
```

PgAdmin nos ayuda teniendo un cliente gráfico para controlar postgres pero no es necesario también se puede usar mediante terminal.

## Conexión con PGAdmin

Para ello nos vamos a nuestro navegador y entramos en el puerto que expone, una vez dentro tendremos que configurar el postgres añadiendole todos los datos necesarios, para ver la ip del contenedor postgres solo tenemos que inpeccionarlo desde terminal con su id.

- `docker ps` para ver los contenedores que están corriendo y ver su id
- `docker inspect idContendor` para inspeccionar y copiar el campo IPAddress

Una vez conectado crearemos las tablas que vallamos a usar y le introduciremos algún dato para las pruevas.

Una cosa a tener en cuenta que la reiniciar el equipo la direccion ip del contendor de postgres puede cambiar y si queremos volver a acceder desde PGAdmin tendremos que ingresar la nueva direccion ip.

## Conexion de nuesta API a la base de datos

Entraremos a nuestro `database.module.ts` y prodecemos a hacer la conexión para ello tendremos que instalar mediante npm:

- `npm i pg` Para realizar conexion
- `npm i @types/pg -D` Para tipado

Ejemplo de conexion:

```TypeScript
import { Module, Global } from '@nestjs/common';
import { Client } from 'pg';

const API_KEY = '1234';
const API_KEY_PROD = 'PROD1234';

const client = new Client({
  user: 'root',
  host: 'localhost',
  database: 'my_db',
  password: '123456',
  port: 5432,
});

client.connect();

@Global()
@Module({
  providers: [
    {
      provide: 'API_KEY',
      useValue: process.env.NODE_ENV === 'prod' ? API_KEY : API_KEY_PROD,
    },
    {
      provide: 'PG',
      useValue: client,
    },
  ],
  exports: ['API_KEY', 'PG'],
})
export class DatabaseModule {}
```

Este módulo al ser gloval puede ser usado desde cualquier otro y mediante un use value lo que compartimos es una instancia de la conexion con lo que nos aseguramos que solo se use una instancia para toda la API.

Para probar que todo funciona iremos a un service y crearemos una función para llamar a base de datos a la que posteriormente llamaremos desde un controller.

Ejemplo:

```TypeScript
import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Client } from 'pg';

import config from './config';

@Injectable()
export class AppService {
  constructor(
    @Inject('PG') private ClientPg: Client,
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
  ) {}

  getHello(): string {
    const apiKey = this.configService.apiKey;
    const dbName = this.configService.database.name;
    return `Hola Mundo! ${apiKey} ${dbName}`;
  }

  getTasks() {
    return new Promise((resolve, reject) => {
      this.ClientPg.query('SELECT * FROM tasks', (err, res) => {
        if (err) reject(err);
        resolve(res.rows);
      });
    });
  }
}
```

## Inllectar cliente usando variables de entorno

Para ello iriamos a nuestro Database module y en lugar de inllectarlo mediante un use service se inllectaria con un use factory al cual a su vez le inllectariamos las el archivo config con las variables de entorno.

```TypeScript
import { Module, Global } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Client } from 'pg';
import config from '../config';

const API_KEY = '1234';
const API_KEY_PROD = 'PROD1234';

@Global()
@Module({
  providers: [
    {
      provide: 'API_KEY',
      useValue: process.env.NODE_ENV === 'prod' ? API_KEY : API_KEY_PROD,
    },
    {
      provide: 'PG',
      useFactory: (configService: ConfigType<typeof config>) => {
        const { user, host, dbName, password, port } = configService.postgres;
        const client = new Client({
          user: user,
          host: host,
          database: dbName,
          password: password,
          port: port,
        });
        client.connect();
        return client;
      },
      inject: [config.KEY],
    },
  ],
  exports: ['API_KEY', 'PG'],
})
export class DatabaseModule {}
```

## QUE ES UN ORM

- Que hace? Capa extra que le ingresamos a nuestra app
- Se encarga de la conexion y todo en base a modelos y entidades
- En esas entidades definidos propiedades y metodos.
- No vamos a realizar codigo sql para ejecutar las operaciones. Pero el ORM nos permite realizar operaciones y consultas complejas.
- Tambien nos abstrae la conexion, asi que nos podemos conectar a diferentes motores.
- Hay dos famosos ORM que se utilizan y son:
  - Sequelize
  - TypeORM

En este caso utilizaremos TypeORM para ello instalaremos:

- `npm install --save typeorm` su nombre lo indica este es el motor typeorm
- `npm install --save @nestjs/typeorm` este es propio de nest y sirve para integrar de una mejor manera typeorm a nest también lo hay en caso de que utilicemos sequelize, en caso de que utilicemos mongoDB tambien tiene uno para mongoose.

La conexión a base de datos se quedaría de la siguiente manera dentro del database.module

```TypeScript
import { Module, Global } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import config from '../config';

const API_KEY = '1234';
const API_KEY_PROD = 'PROD1234';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [config.KEY],
      useFactory: (configService: ConfigType<typeof config>) => {
        const { user, host, dbName, password, port } = configService.postgres;
        return {
          type: 'postgres',
          host,
          port,
          username: user,
          password,
          database: dbName,
        };
      },
    }),
  ],
  providers: [
    {
      provide: 'API_KEY',
      useValue: process.env.NODE_ENV === 'prod' ? API_KEY : API_KEY_PROD,
    },
  ],
  exports: ['API_KEY', TypeOrmModule],
})
export class DatabaseModule {}
```

Ahora con las entities que teníamos creadas las tendremos que modificar por medio de unos decoradores que le añadirán la funcionalidad de comunicarse con la base de datos.

Ejemplo de un entity:

```TypeScript
import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn() //Indica que es un ID autogenerado
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'int' })
  stock: number;

  @Column({ type: 'varchar', length: 255 })
  image: string;
}
```

A la hora de tipar los campos hay que tener en cuenta que algunos tipos son expecífico de una vase de datos en particular y en caso de que se cambie a otra no nos funcionará por ello si queremos que se pueda cambiar entre bases de datos sin problema mejor usar tipos que sean coincidentes en todas.

En el modulo se importaría de la siguiente manera:

```TypeScript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsController } from './controllers/products.controller';
import { CategoriesController } from './controllers/categories.controller';
import { BrandController } from './controllers/brand.controller';

import { ProductsService } from './services/products.service';
import { CategoryService } from './services/category.service';
import { BrandService } from './services/brand.service';

import { Product } from './entities/product.entity';
import { Brand } from './entities/brand.entity';
import { Category } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Brand, Category])],
  controllers: [ProductsController, CategoriesController, BrandController],
  providers: [ProductsService, BrandService, CategoryService],
  exports: [ProductsService],
})
export class ProductsModule {}
```

Ejemplo de como quedaría un service:

```TypeScript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from '../entities/product.entity';
import { CreateProductDto, UpdateProductDto } from '../dtos/products.dtos';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  findAll() {
    return this.productRepo.find({});
  }

  async findOne(id: number) {
    const product = await this.productRepo.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  create(payload: CreateProductDto) {
    const newProduct = this.productRepo.create(payload); //Crea la instancia
    return this.productRepo.save(newProduct); //Guarda en la base de datos
  }

  async update(id: number, payload: UpdateProductDto) {
    const product = await this.productRepo.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    this.productRepo.merge(product, payload); //Coje el producto y le añade los cambios
    return this.productRepo.save(product);
  }

  async delete(id: number) {
    const product = await this.productRepo.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return this.productRepo.delete(id);
  }
}
```
