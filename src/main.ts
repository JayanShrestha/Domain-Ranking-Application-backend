import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  //const app = await NestFactory.create(AppModule);
  //app.enableCors({
  //origin:'http://localhost:5173', // vue dev server
  // Credentials:true,
  // })
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,POST,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}

void bootstrap();
