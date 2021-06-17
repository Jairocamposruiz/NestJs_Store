import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Validacion de parametros de entrada en body
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  //Interceptor para serialización
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  //Autodocumentacion con Swagger
  const config = new DocumentBuilder()
    .setTitle('API STORE')
    .setDescription('STORE NEST JS')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  //Deshabilitar los cors
  app.enableCors();

  await app.listen(3000);
}
bootstrap();
