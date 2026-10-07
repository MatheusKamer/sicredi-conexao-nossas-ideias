import { Module } from '@nestjs/common';
import { DatabaseModule } from './shared/database/database.module';
import { RequestsModule } from './modules/requests/requests.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './modules/auth/auth.guard';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [DatabaseModule, RequestsModule, AuthModule, UsersModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
