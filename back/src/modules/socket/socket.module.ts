import { Module } from '@nestjs/common';
import { socketGateway } from './socket.gateway';

@Module({
	providers: [socketGateway],
	exports: [socketGateway],
})
export class SocketModule {
	
}
