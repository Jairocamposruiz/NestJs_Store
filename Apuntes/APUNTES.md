# Pasos para empezar un proyecto NestJS

* Instalar NEST JS de manera gloval con el comando: ```npm i -g @nestjs/cli```
* Crear un nuevo proyecto con el comando ```nest new NombreProyecto```
* Como paso opcional añadir el archivo *.editorconfig* para que todos los que trabajen en el proyecto tengan las mismas configuraciones.

Nest es un framework que como tal ya trae muchas configuraciones hechas, por defecto viene para trabajar en TypeScript y trae todas las configuraciones de eslint y prettier.

Con el comando ```nest --help``` podemos ver todos los comandos que admite nest.

---

## Controladores (Controller)

Son el componente que recibe los request del lado del cliente, los valida y se los pasa al siguiente componente que es el service.

Para crear un controller en nest tenemos la ayuda de nest que desde la terminal nos permite ejecutar un comando para que nos cree el elemento que necesitemos para crear el controller el comando será el siguiente: 

```Bash
nest g co controllers/categories --flat
```

Explicación del comando:

* g => generate para generar un elemento
* co => controller el tipo de elemento
* controllers => la carpeta donde se guardará
* categories => el nombre del controlador y la subcarpeta
* --flat => si no queremos que genere subcarpeta especifica con el nombre del controlador, en mi caso me gusta más no ponerlo para que se cree la subcarpeta.

Mas información en la [documentación de NestJS](https://docs.nestjs.com/cli/usages#nest-generate)

Esta acción tambien lo añade al app.module.ts a un array con los controladores.

---

## Servicios (Service)

Reciben ordenes del controlador y se conentan a los DataModel y los DataAccess para manipularlos y devolver la información al controller.

***En los servicios en donde entraría nuestra lógica de empresa.***

Para crear un controller el comando es el siguiente:

```Bash
nest g s modules/order/service/order --flat
```

---

## Ejemplo de los comando utilizados para crear el sistema de carpetas de este proyecto

Este sistema de carpetas es muy escalable, se basa en modulos y nos ayudará en caso de querer combertir nuestro proyecto a micro servicios.
No es necesario usar este sistema de carpetas puesto que NestJS entenderá cualquier otro que elijamos.

```Bash
nest g co modules/order/controller/order --flat
nest g mo modules/order/module/order --flat
nest g s modules/order/service/order --flat
nest g co modules/user/controller/user --flat
nest g mo modules/user/module/user --flat
nest g s modules/user/service/user --flat
nest g co modules/customer/controller/customer --flat
nest g mo modules/customer/module/customer --flat
nest g s modules/customer/service/customer --flat
nest g co modules/category/controller/category --flat
nest g mo modules/category/module/category --flat
nest g s modules/category/service/category --flat
nest g co modules/product/controller/product --flat
nest g mo modules/product/module/product --flat
nest g s modules/product/service/product --flat
nest g co modules/brand/controller/brand --flat
nest g mo modules/brand/module/brand --flat
nest g s modules/brand/service/brand --flat
```

---

## Arquitectura de la aplicación

![Arquitectura de la aplicación](./ArquitecturaAplicación.png)

---

## Pipes

Los pipes tienen dos funciones principales validar y transformar datos son muy utiles a la hora de recibir datos de las url las cuales siempre nos llegan como string esto puede ser un problema a la hora de pasarle datos a nuestras funciones ejemplo una función que espera recibir un número.

Para solucionarlo utilizaremos un Pipe que valida si la cadena de texto es numerica o contiene letras y da dos soluciones:

* Si es numerica los transforma a un dato number para que la función lo tome sin problemas
* Si contiene letras debuelve un error indicando cual fue el problema

Este es solo un ejemplo pero hay mas tipos de Pipe para validar diferentes tipos de datos.

Para su uso solo tenemos que importarlos de ***@nestjs/common*** dentro del archivo.

Su implementación es muy sencilla, ejemplo de uso:

```JavaScript
@Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }
```

Los pipes tambien podemos crearlos en caso de necesitar uno que se adapte mejor a nuestro caso de uso.

Para ello escribiremos el comando:

```Bash
nest g pipe common/parse-int
```

Donde:

* g => generar
* pipe => el elemento a generar
* common => nombre de la carpeta por estandar se suele poner este
* parse-int => nombre del pipe el que querramos

Una vez generado el pipe crearemos la lógica dentro de el. Mas información de los Pipes en la [Documentación](https://docs.nestjs.com/pipes).

Para su uso es exactamente igual que los que trae NestJs con la unica diferencia de que la importación sería desde el archivo del proyecto.

---

## Data Transfers Objects(DTOS)

Nos permiten tipar y validar los datos que vienen de la petición en el ( body )
Se suele crear una carpeta en src llamada ***dtos*** y en ella los crearemos.

Ejemplo de un DTO:

```JavaScript
export class CreateProductDto {
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly stock: number;
  readonly image: string;
}
```

Para usarlos los importaremos en el controller y el service y lo pasaremos como un tipo de TipeScript.
Esto solo funciona a la hora de programar pero en tiempo de ejecución no tendremos tipado es como el tipado de TypeScript. Se suelen implementar con los datos de solo lectura para que nos los modifiquemos.

---

## Validar parametros con Class-validator y Mapped-types

Esta si es una validación de tipos en tiempo de ejecución. Para ello tendremos que instalar las siguientes dependencias con npm:

```Bash
npm i class-validator class-transformer
```

Para su uso importaremos el class-validator en el archivo DTO y se usará a modo de decorador este paquete tiene validadores para casi todo tipo de datos como string, number, boolean o datos más complejos como email, url etc. O incluso para que nos se envíen datos en blanco.

Ejemplo de implementación:

```JavaScript
import { IsString, IsNumber, IsUrl, IsNotEmpty } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @IsNumber()
  @IsNotEmpty()
  readonly price: number;

  @IsNumber()
  @IsNotEmpty()
  readonly stock: number;

  @IsUrl()
  @IsNotEmpty()
  readonly image: string;
}
```

Podemos modificar el mensaje que viene por defecto en los validator de la siguiente manera:

```JavaScript
@IsString({message: 'My custom message'})
```

Tambien devemos añadir un Pipe gloval a la aplicacion en el archivo main.ts este archivo se llama ValidationPipe y proviene de '@nestjs/common'.

Ejemplo de implementación:

```JavaScript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
```

Con esto el class-validator ya funcionará.

Como opcional podemos también instalar con npm el siguiente paquete de NestJs:

```Bash
npm i nestjs/mapped-types
```

Esto nos ayudará a no repetir código cuando tengamos te tipar varios DTO parecidos.

Ejemplo de uso:

```JavaScript
export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

Esto conseguirá eredar el tipado y todos los validadores de la clase que le pasemos al PartialType y le añadirá el atributo opcional. Esto biene genial cuando tenemos que crear la clade de modificar un valor puesto que no siempre vendrán todos los datos.

Hasta el momento validamos los parametros de entrada que coincidan con los tipos que le ponemos y con las condiciones que le ponemos pero en caso de que añadan mas parámetros en el body estos no haran saltar ningun fallo y entrarán sin problemas. Esto puede ser un problema de seguridad dependiendo de la base de datos que estemos usando, por ejemplo si es SQL no tendríamos mucho problema puesto que al añadir los datos si no cumplen con las casillas de la tabla simplemente los ignora, pero otro tipo de bases de datos ejemplo las orientadas a documento como mongo al ser más flexibles a cambios.

Esto hay que controlarlo ya sea por problemas de seguridad, por que se metán datos de más que no necesitamos o por posibles errores que puedan causar al mover dichos datos por nuestra aplicación.

Para ello en el main.ts en el ValidationPipe gloval le añadiremos el siguiente objeto de configuración:

```JavaScript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(3000);
}
```

* ```whitelist: true``` nos eliminará todo atributo que no aparezca en el DTO al entrar a nuestra aplicación. Este deberíamos de añadirlo siempre que implementemos los DTO. Todo funcionará simplemente eleminará lo sobrante y seguirá su camino.
* ```forbidNonWhitelisted: true``` este es más opcional lo que hace es que le ponga un error al request para que lo solucionen en lugar de ignorar el parámetro simplemente le dice o solucionas este problema o no te cojo los datos. En mi opinión es muy recomendable puesto que si algo no se está haciendo bien es mejor mandar error y solucionarlo que ignorarlo por que entre otras cosas los request serán más pesado con datos que al llegar serán eliminados.

---

## Modulos

NestJs trabaja con módulos esto es muy util para separar el código por su tipo de uso pero también nos causa algunos problemas de depedencias. Por ejemplo que pasa si necesitamos una función que está escrita en otro módulo, por ejemplo una función de un servicio, si lo solo lo importáramos esto daría un error. Para poder hacerlo tendríamos que seguir unos sencillos pasos:

* Del modulo que necesitemos la función tenemos que exportar el archivo de la siguiente manera en su archivo .module.ts
  
```JavaScript
import { Module } from '@nestjs/common';

import { ProductsController } from './controllers/products.controller';
import { BrandsController } from './controllers/brands.controller';
import { CategoriesController } from './controllers/categories.controller';
import { ProductsService } from './services/products.service';
import { BrandsService } from './services/brands.service';
import { CategoriesService } from './services/categories.service';

@Module({
  controllers: [ProductsController, CategoriesController, BrandsController],
  providers: [ProductsService, BrandsService, CategoriesService],
  exports: [ProductsService], //Export del archivo que necesitamos en el otro módulo
})
export class ProductsModule {}
```

* Siguiente paso en el módulo que la necesitemo iremos al mismo archivo .module.ts e importaremos el otro módulo de la siguiente manera:

```JavaScript
import { Module } from '@nestjs/common';

import { CustomerController } from './controllers/customers.controller';
import { CustomersService } from './services/customers.service';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule], //Import del módulo
  controllers: [CustomerController, UsersController],
  providers: [CustomersService, UsersService],
})
export class UsersModule {}
```

* Una vez hecho esto importamos la clase que contenía la función donde la necesitemos y creamos una instancia de la misma:

```JavaScript
import { Injectable, NotFoundException } from '@nestjs/common';

import { User } from '../entities/user.entity';
import { Order } from '../entities/order.entity';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';

import { ProductsService } from '../../products/services/products.service'; //Importación

@Injectable()
export class UsersService {
  constructor(private readonly productService: ProductsService) {} //Instancia de la clase que necesitamos

```

Con esto estará todo y NestJs lo correrá sin problemas. Esto que hemos utilizado se llama ***useClass*** y lo que hace es que inyecta dependencias de la clase tal como lo hace spring en Java. Para que esto funciones la clase tiene que llevar el decorador Injectable().

Tambiem podemos inyectar otro tipo de datos haciendo uso de ***useValue*** pero se hace de diferente forma ejemplo de inyeccíon de una variable:

* Exportación de dicha variable en este caso se llama API_KEY:

```JavaScript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';

const API_KEY = '1234';

@Module({
  imports: [UsersModule, ProductsModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'API_KEY',
      useValue: API_KEY,
    },
  ],
})
export class AppModule {}

```

* Importación de dicha variable:

```JavaScript
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(@Inject('API_KEY') private apiKey: string) {}

  getHello(): string {
    return `Hello World! ${this.apiKey}`;
  }
}
```

Con esto podemos exportar un valor que se use através de toda la aplicación.
El ultimo de los providers se llama ***useFactory*** este tiene dos atributos clave uno es que es asincrono y otro que puede recivir inyecciones.

En este ejemplo crearemos una función asincrona que hace una petición a otro servidor usando ***HttpModule*** que es una librería que trae de por sí NestJS y que por devajo usa AXIOS.
Esto es solo un ejemplo de uso pero no es recomendable hacer llamados a una API desde hay puesto que ralentizariamos mucho nuestro servicio, esto se suele usar por ejemplo para hacer peticiones a bases de datos.
El modulo ***HttpModule*** es mejor usarlo desde dentro de un servicio de esta manera no lo ralentizaremos puesto que useFactori paraliza todo hasta tener la respuesta.

* Exportando la función:

```JavaScript
import { Module, HttpModule, HttpService } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';

const API_KEY = '1234';

@Module({
  imports: [HttpModule, UsersModule, ProductsModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'API_KEY',
      useValue: API_KEY,
    },
    {
      provide: 'TASKS',
      useFactory: async (http: HttpService) => {
        const tasks = await http
          .get('https://jsonplaceholder.typicode.com/todos')
          .toPromise();
        return tasks.data;
      },
      inject: [HttpService],
    },
  ],
})
export class AppModule {}
```

* Importando desde el service:

```JavaScript
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(
    @Inject('API_KEY') private apiKey: string,
    @Inject('TASKS') private tasks: any[],
  ) {}

  getHello(): string {
    return `Hello World!gsdfg ${this.apiKey}, ${this.tasks}`;
  }
}
```

---

## Global Module

El módulo gloval será instanciado en todos los demás módulos sin que nosotros tengamos que hacerlo explicitamente.

Los providers que hemos visto en los anteriores ejemplos solo hacen efecto en el módulo que se usan pero si los usamos junto al módulo global lo que conseguimos es que estarán disponibles desde toda la aplicación. Hay que tener mucho cuidado con esto puesto que no es muy recomendado tener muchas cosas glovales dentro de las aplicaciones segun los principios SOLID.

Pero usandolo con cuidado puede sernos de mucha utilidad. Ejemplo una conexión a una base de datos en la mayoría de los casos querremos que sea compartida por toda la aplicación.

Para crear un módulo global utilizaremos el siguiente comando de NestJs:

```Bash
nest g mo database
```

Es la misma manera de la que se crea cualquier módulo, pero dentro del módulo le añadiremos el decorador ***Global***. Una vez puesto dicho decorador todos los providers que le pongamos serán instanciados para toda la aplicación.

* El módulo global quedaría tal que así:

```JavaScript
import { Module, Global } from '@nestjs/common';

const variable = 'Variable global para toda la aplicación';

@Global()
@Module({
  providers: [
    {
      provide: 'VARIABLE',
      useValue: variable,
    },
  ],
  exports: ['VARIABLE'],
})
export class DatabaseModule {}
```

El ejemplo se hace con una variable pero podríamos poner cualquier provider como por ejemplo una clase service como las de los otros módulos del proyecto.

Para su uso sería igual que cualdo lo hacemos localmente injectandolo en la clase.

---

## Modulo de Configuración

Este módulo nos permite tener configuraciones de entorno mediante variables de entorno para esto necesitaremos intalar un paquete que NestJs mediante npm con el siguiente comando:

```Bash
npm i @nestjs/config
```

Este módulo por detras utiliza dotenv para manejar las variables de entorno y al igual que dotenv tenemos que intalarlo como dependencia de producción.

Una vez instalado para empezar a utilizarlo tendremos que crear nuestro archivo ***.env*** con las variables de entorno. No se nos puede olvidar ignorarlos en el .gitignore

Una vez creado el archivo para que NestJS lo lea tenemos que ir a nuestro app.module.ts e importar:

```JavaScript
import { ConfigModule } from '@nestjs/config';
```

Una vez importado en el archivo tendremos que añadirlo a los imports del módulo.

```JavaScript
@Module({
  imports: [
    HttpModule,
    UsersModule,
    ProductsModule,
    DatabaseModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
  ],
```

Con esto ya tendriamos disponibles las variables de entorno de forma gloval para nuestra aplicación.

Ahora para utilizarlas en el archivo que necesitemos tenemos que importar:

```JavaScript
import { ConfigService } from '@nestjs/config';
```

Lo instanciamos en el constructor como cualquier otro service:

```TypeScript
constructor(
    private readonly productService: ProductsService,
    private configService: ConfigService,
  ) {}
```

Y la tendremos disponible para su uso:

```JavaScript
const databaseName = this.configService.get('DATABASE_NAME');
```

---

## Configuración por ambientes

Para ello tendremos tantos archivos de variables de entorno como querramos ejemplo:

* .env
* .prod.env
* .stag.env

Y tantos como querramos estos archivos normalmente tendrán las mismas variables de entornos solo que con diferentes valores.

Ahora en la carpeta src crearemos un archivo enviroments.ts con el siguiente contenido:

```TypeScript
export const enviroments = {
  dev: '.env',
  stag: '.stage.env',
  prod: '.prod.env',
};
```

Ahora iremos al app.module.ts, lo importamos y usaremos de la siguiente manera:

```TypeScript
import { enviroments } from './enviroments';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: enviroments[process.env.NODE_ENV] || '.env',
      isGlobal: true,
    }),
    HttpModule,
    UsersModule,
    ProductsModule,
    DatabaseModule,
  ],
```

Aquí se le dice que segun la variable que se le pase .NODE_ENV al arranque del programa utilice una u otra y en caso de no encotrar la indicada utilice el .env que en este caso sería el de desarrollo.

Para introducir la variable NODE_ENV en el arranque es de la siguiente manera:

* Windows(Usando PowerShell)

```Bash
$env:NODE_ENV="prod"; npm run start:dev
$env:NODE_ENV="stag"; npm run start:dev
$env:NODE_ENV="dev"; npm run start:dev
```

* Linux, Mac o Window(Usando Bash)

```Bash
NODE_ENV=prod npm run start:dev
NODE_ENV=stag npm run start:dev
```

---

## Tipado en Config

Tal y como está hecho hasta ahora funcionaría todo perfectamente pero a la hora de llamar a una variable de entorno en el archivo que la necesitemos no nos dice en ningun momento si dicha variable está bien escrita o si el valor que trae es el que necesitamos.

Para ello podemos añadir tipado. Esto se hace de la siguiente manera:

Creamos un archivo de config.ts en src. como el siguiente:

```TypeScript
import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  return {
    database: {
      name: process.env.DATABASE_NAME,
      port: process.env.DATABASE_PORT,
    },
    apiKey: process.env.API_KEY,
  };
});
```

Este ademas nos permite agrupar por tipos ejemplo Base de datos, APIs etc...

El siguiente paso es en el app.module añadir otra configuración que el el load añadiendole la importación del archivo config, ejemplo de como quedaría:

```TypeScript
import { enviroments } from './enviroments';
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: enviroments[process.env.NODE_ENV] || '.env',
      load: [config],
      isGlobal: true,
    }),
    HttpModule,
    UsersModule,
    ProductsModule,
    DatabaseModule,
  ],
```

Para su uso sería de la siguiente manera:

```TypeScript
import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import config from './config';

@Injectable()
export class AppService {
  constructor(
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
  ) {}

  getHello(): string {
    const apiKey = this.configService.apiKey;
    const name = this.configService.database.name;
    return `Hello World!gsdfg ${apiKey}, ${name}`;
  }
}
```

---

## Validación de esquemas en .envs con Joi

Para poder hacer esta validación tendremos que descargar el siguiente paquete de npm como dependencia de produccion:

```Bash
npm i joi
```

Ahora tendremos que ir a app.module.ts e importaremos joi de la siguiente manera:

```TypeScript
import * as Joi from 'joi';
```

Le añadiremos un validationSchema al ConfigModule y con ayuda de Joi le añadiremos el objeto de validación con el que comprovará que están todas las variables de entorno necesaria y si cumplen con el formato requerido.

Esto es muy util puesto que tendremos muchas variables de entorno y muchos archivos de variables de entorno diferente y a la hora del arranque de la aplicación en un servidor nos podemos encontrar errores por falta de una variable de entorno que no fue introducida, estos errores son muy dificiles de debuguear puesto que muchas veces no saves de donde viene dicho error.

Hay que pensar que nosotros a la hora de programar solemos usar estos archivos .env pero en entornos mas profesionales a la hora del despliegue en sitios como la nuve de amazon o google no se hace de esta manera y se introducen a mano en el munu correspondiente de despliegue lo que puede probocar fallos si no se cópian devidamente.

El app.module.ts se quedaría de la siguiente manera:

```TypeScript
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: enviroments[process.env.NODE_ENV] || '.env',
      load: [config],
      isGlobal: true,
      validationSchema: Joi.object({
        API_KEY: Joi.number().required(),
        DATABASE_NAME: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
      }),
    }),
    HttpModule,
    UsersModule,
    ProductsModule,
    DatabaseModule,
  ],
```

Y en caso de intentar arrancar nuestro servidor sin una de las variables nos saldría un error indicando que variable falta y que es requerida para funcionar, no dejandonos tener errores en producción por esto.

---

## Swagger y PartialType con Open API

La especificación Open API es un estandar para escribir buena documentación de las REST APIs para más información sobre estas especificaciones podemos visitar su sitio web [OPEN API DOCUMENTACION](https://spec.openapis.org/oas/v3.1.0).

En la documentación oficial de NestJS tenemos un apartado dedicado a OPEN API donde nos indica unos módulos para la automatización del proceso. [NestJS DOCUMENTACION](https://docs.nestjs.com/openapi/introduction).

Este módulo funciona con Swagger para usarlo tendremos que instalar la siguiente dependencia:

```Bash
npm install --save @nestjs/swagger swagger-ui-express
```

Una vez instalado tendremos que ir al archivo main.ts y añadirle algunas configuraciones quedaría como este:

```TypeScript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API Store')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}
bootstrap();
```

Una vez hecho esto podremos arrancar nuestra API y acceder al endpoint especificado en este caso ***<http://localhost:3000/docs/>*** para ver la documentación.

Esta información no estará del todo completa faltarían los DTOSs y Entities para añadirlos, en la [Documentación](https://docs.nestjs.com/openapi/cli-plugin#using-the-cli-plugin) podemos ver como implementarlo.

Para ello iremos al archivo nest-cli.json que está en la raiz del proyecto y añadirle unas líneas de código.

Quedando como este:

```Json
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": ["@nestjs/swagger"]
  }
}
```

Otro paso sería en los archivos de los dtos cambiar la importación de PartialType de esta:

```TypeScript
import { PartialType } from '@nestjs/mapped-types';
```

a esta:

```TypeScript
import { PartialType } from '@nestjs/swagger';
```

una vez hecho esto para ver la documentación tendremos que parar el servidor, y ejecutar el siguiente comando:

```Bash
rm -rf dist
```

para que elimine la carpeta dist donde estaba la documentación de swagger, ahora arrancaremos el servidor de nuevo y ya se puede ver la documentación nueva.

Para añadir una documentación más específica en los DTOs podemos añadir el decorador @ApiProperty y quedaría como el siguiente ejemplo.

```TypeScript
import { IsString, IsNotEmpty, IsEmail, Length } from 'class-validator';
import { PartialType, ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  @IsEmail()
  @ApiProperty({ description: 'The email of User' })
  readonly email: string;
```

 Esto solo es necesario si es una propiedad algo compleaja de entender no como en el ejemplo que es un email.

Otra cosa que podemos hacer es agrupar los endpoints por que por defecto swagger los deja en forma de lista lo cual dificulta buscar uno en especifico cuando tenemos muchos.

Para ello en los controladores importaremos lo siguiente:

```TypeScript
import { ApiTags } from '@nestjs/swagger';
```

Este decorador se le añadirá a los controladores de esta manera todos los endpoints que le pertenezcan se agruparan bajo este tag

```TypeScript
@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  getProducts(
    @Query('limit') limit = 100,
    @Query('offset') offset = 0,
    @Query('brand') brand: string,
  ) {
    return this.productsService.findAll();
  }

  @Get('filter')
  getProductFilter() {
    return `yo soy un filter`;
  }
```

Otra cosa que podemos hacer es añadirle una documentación extra a los endpoints con mayor dificultad de entendimiento para ello importaremos en el controller:

```Typescript
import { ApiOperation } from '@nestjs/swagger';
```

y se le añadiría al endpoint de la siguiente manera:

```TypeScript
@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @ApiOperation({ summary: 'List of products' })
  @Get()
  getProducts(
    @Query('limit') limit = 100,
    @Query('offset') offset = 0,
    @Query('brand') brand: string,
  ) {
    return this.productsService.findAll();
  }
```

---

## Despliegue de la aplicación

Todas las APIs que creemos ya sea con nestJs jango larave spring o cualquier otra vienen con una configuración por defecto en los ***Cors*** esto hace que solo se le pueda hacer peticiones desde el mismo servidor, es lo más normal puesto que cuando hagamos nuestro frontend se suele desplegar en el mismo servidor pero cuando estamos desplegando el frontend y el backend o incluso otro bankend que se comunique con este en diferentes servidores tenemos que abilitar para que esto pueda pasar.

Para ello iremos a nuestro archivo main.ts y le añadiriamos la siguiente linea antes del app.listen:

```TypeScript
app.enableCors();
```

Esto se puede configurar de muchas maneras incluyendo dominios específicos que puedan acceder a ellos por ejemplo.

Seguido de eso para hacer un despliegue en Heroku por ejemplo solo tendriamos que seguir la documentación del mismo como si fuera una aplicación de Node nada más.
