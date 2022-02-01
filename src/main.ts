import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
<<<<<<< HEAD
  const PORT = process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT);
  console.log("App Listening on Port : " + PORT);
=======
  const PORT : number = 8000;
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT);
>>>>>>> f429c4665c5376c5043a31bb632f9e1e0c784c8b
}
bootstrap();
