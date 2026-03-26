import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Validación automática de todos los DTOs con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // Elimina propiedades no declaradas en el DTO
      forbidNonWhitelisted: true, // Rechaza requests con propiedades extra
      transform: true,       // Transforma payloads al tipo del DTO automáticamente
    }),
  );

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`🚀 Pórtico Backend corriendo en: http://localhost:${port}/api`);
}
bootstrap();
