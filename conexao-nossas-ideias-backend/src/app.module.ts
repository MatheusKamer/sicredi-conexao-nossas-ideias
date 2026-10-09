import { Module } from '@nestjs/common';
import { DatabaseModule } from './shared/database/database.module';
import { RequestsModule } from './modules/requests/requests.module';
import { APP_GUARD } from '@nestjs/core';
import { AreasModule } from './modules/areas/areas.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthGuard } from './modules/auth/auth.guard';

@Module({
  imports: [
    DatabaseModule,
    RequestsModule,
    AuthModule,
    UsersModule,
    AreasModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
