import * as dotenv from 'dotenv';  // Add this import
dotenv.config();  // Make sure to call dotenv.config() before creating the app

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: '*',  // Разрешает запросы с любого домена, можно настроить на конкретный домен
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Разрешаем методы
    allowedHeaders: ['Content-Type', 'Authorization'], // Разрешаем определенные заголовки
  });
  const config = new DocumentBuilder()
    .setTitle('Document Management API')
    .setDescription('API for managing documents and authentication')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // URL для Swagger

  await app.listen(8080);
}
bootstrap();
