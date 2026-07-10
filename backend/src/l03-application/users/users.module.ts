import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from '../../l05-infrastructure/database/database.module';
import { UsersController } from '../../l01-presentation/users/users.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
