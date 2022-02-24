import { NestFactory } from '@nestjs/core';
import { WsAdapter } from './adapters/socket.adapter';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const PORT = process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useWebSocketAdapter(new WsAdapter(app));
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true
    }
  }));
  app.setGlobalPrefix('api/v1');
  await app.listen(PORT);
  console.log(process.env.PORT);
  console.log(process.env.UID); 
  console.log(process.env.SECRET); 
  console.log(process.env.API_LINK); 
  console.log(process.env.REDIRECT_URI); 
  console.log(process.env.JWT_KEY); 
  console.log("App Listening on Port : " + PORT);
}
bootstrap();
