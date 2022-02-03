import { Injectable } from '@nestjs/common';
import { socketGateway } from './modules/socket/socket.gateway';

@Injectable()
export class AppService {
  constructor(private socketGateway: socketGateway){}
  getHello(): string {
    return 'Hello World!';
  }
}
