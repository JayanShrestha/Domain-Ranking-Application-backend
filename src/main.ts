import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin:'http://localhost:5173', // vue dev server
    Credentials:true,
  })
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
console.log('ENV TEST:', process.env.DB_PORT);
