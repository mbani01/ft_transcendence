import { NestFactory } from '@nestjs/core';
import { WsAdapter } from './adapters/socket.adapter';
import { AppModule } from './app.module';

async function bootstrap() {
  const PORT = process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule);
  app.enableCors()
  app.useWebSocketAdapter(new WsAdapter(app));
  app.setGlobalPrefix('api');
  await app.listen(PORT);
  console.log("App Listening on Port : " + PORT);
}
bootstrap();
