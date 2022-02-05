import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  exports: [UsersService], // export User's BL to be available for other modules.
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
