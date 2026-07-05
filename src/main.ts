import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure Swagger options
  const config = new DocumentBuilder()
    .setTitle('PartidosYa API')
    .setDescription('The PartidosYa API description')
    .setVersion('1.0')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
