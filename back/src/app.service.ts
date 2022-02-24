import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { socketGateway } from './modules/socket/socket.gateway';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
