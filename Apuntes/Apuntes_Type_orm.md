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

---

## MIGRACIONES

### ***GENERAR MIGRACIONES***

Las migraciones son una manera de controlar los cambios hacia la base de datos, hasta la fecha hemos estado trabajando con el parámetro ` synchronize: true` en el modulo de database, esto se puede hacer cuando estamos creando un proyecto por que no tenemos datos en la base de datos que podamos borrar o contaminar puesto que este parámetro lo que consigue es que los cambios que realicemos en nuestras entities se le transmitan a la base de datos pudiendo llegar a borrar columnas de las tablas existentes.

Las migraciones son una buena practica que las usemos incluso al principio de nuestra aplicación.

Para ello existen las migraciones que son como un control de versiones de la base de datos que nos protejen de algunos fallos que podamos probocar.

TypeOrm tiene un cli que nos alluda a generar las migraciones de forma automática, pero para ello tenemos que añadir una configuración para integrarlo en nuestro proyecto.

Esta configuración puede ser añadidia mendiante un archivo ormconfig.json o mediante variables de entorno que es la manera que usaremos en nuestro proyecto puesto que es más flexible a la hora de desplegar en diferentes ambientes.

[Info sobre configuración](https://typeorm.io/#/using-ormconfig/using-environment-variables) esta página se pueden ver todas las configuraciones que podemos añadirle a nuestro proyecto.

Una vez añadidas las variables de entorno tambien tenemos que ir a nuestro archivo package.json para configurar unos scripts para el uso del cli.

```json
"typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js",
"migrations:generate": "npm run typeorm -- migration:generate -n"
```

Una vez hecho todo esto para generar la migración se hace con el comando en consola: `npm run migrations:generate -- init` el init en este caso es el nombre de la migración podemos ir cambiando de nombre y de esta manera guardar diferentes copias de la base de datos con sus diferentes versiones o también podemos dejar el mismo nombre puesto que la migración le añade al nombre un timestamp que diferencia entre migraciones para que no se pisen unas a otras.

Si inspeccionamos el archivo que se genera podemos ver que es un archivo tipe script con ordenes SQL que generan las tablas. Por ello en cualquier momento podemos ejecutar este archivo y generar las tablas que teníamos en otras versiones de la aplicación.

Ejemplo del archivo:

```TypeScript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class init1623680390527 implements MigrationInterface {
  name = 'init1623680390527';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "brand" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "image" character varying(255) NOT NULL, CONSTRAINT "UQ_5f468ae5696f07da025138e38f7" UNIQUE ("name"), CONSTRAINT "PK_a5d20765ddd942eb5de4eee2d7f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "category" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, CONSTRAINT "UQ_23c05c292c439d77b0de816b500" UNIQUE ("name"), CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "description" text NOT NULL, "price" integer NOT NULL, "stock" integer NOT NULL, "image" character varying(255) NOT NULL, CONSTRAINT "UQ_22cc43e9a74d7498546e9a63e77" UNIQUE ("name"), CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "customer" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "lastName" character varying(255) NOT NULL, "phone" character varying(20) NOT NULL, CONSTRAINT "PK_a7a13f4cacb744524e44dfdad32" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order" ("id" SERIAL NOT NULL, CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "role" character varying(255) NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "order"`);
    await queryRunner.query(`DROP TABLE "customer"`);
    await queryRunner.query(`DROP TABLE "product"`);
    await queryRunner.query(`DROP TABLE "category"`);
    await queryRunner.query(`DROP TABLE "brand"`);
  }
}
```

### ***EJECUTAR MIGRACIONES***

Para ello tendremos que generar nuevos scripts en nuestro package.json:

```json
Esta ejecuta la migración:
"migrations:run": "npm run typeorm -- migration:run"

Nos da información de las migraciones que se han corrido:
"migrations:show": "npm run typeorm -- migration:show"

Esta es muy delicada puesto que borra todo de la base de datos y borra las migraciones:
"migrations:drop": "npm run typeorm -- migration:drop"
```

Hay muchos mas comando que podemos añadir con diferentes funcionalidades que se pueden adaptar a nuestro proyecto.

Para probar las migraciones le haremos algun cambio a la entity products añadiendole dos campos más que son muy buena practica uno que diga cuando se creó y otro que diga cuando se modificó.

Estos son los cambios:

```TypeScript
  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz', //este parametro ajusta la zona horaria automaticamente
    default: () => 'CURRENT_TIMESTAMP',
  })
  updateAt: Date;
```

Una vez hechos estos cambios procederemos con la migración. Ejecutando los siguientes comandos en la terminal:

```Bash
npm run migrations:generate -- "add-fields"
npm run migrations:run
```

El add-fields es el nombre del archivo.

Si teníamos productos en la tabla esto añadirá este campo a todos los productos que ya estubieran creado solo que la fecha que pondrá en todos será la de cuando se ejecutó la migración.

Otra cosa que hacen las migraciones es que en la base de datos se crea una tabla automaticamente que lleva un control de todas las migraciones que ejecutemos.

## RELACIONES EN BASES DE DATOS

En las bases de datos hay 3 tipos de relaciones:

- Uno a Uno
- Uno a Muchos
- Muchos a Muchos

Con typeOrm también se pueden manejar estas relaciones desde los entities.

- Un ejemplo de Uno a Uno:

    Lo tenemos entre los entities customer y user. En estos entities se hace referencia de uno al otro y vicebersa pero el decorador JoinColumn solo lo tiene uno de ellos que donde se guardará la referencia en la base de datos.
    Tambien tenemos que modificar los el service de la clase con el JoinColumn y su dto para añadir este campo a la hora de la creación y para añadir unos parametros a la busque y que al mostrar los elemento los muestre con las relaciones si es que las queremos de esta manera.

- Ejemplo de Uno a Muchos:

    Lo tenemos entre los entities de brand y product, puesto que un producto solo tiene una marca pero una marca tiene muchos productos. En este caso no necesitamos el JoinColumn puesto que el se lo añade solo a la que tiene la propiedad ManyToOne que en este caso es product.

- Ejemplo de Muchos a Muchos:

    Lo tenemos entre los entities de product y category, puesto que en una categoria hay muchos productos y un producto puede tener varias categorias.
    Como esto en las bases de datos no se puede hacer directamente lo que se suele hacer es crear una tercera tabla que hace de intermediaria entre ambos.Esta tabla la crea TypeOrm automaticamente gracias al decorator ManyToMany y al decorador JoinTable este decorador solo irá puesto en un lado de la relación pero no importa mucho en que lado valla.
