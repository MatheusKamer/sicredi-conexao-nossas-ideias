import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DatabaseModule } from './shared/database/database.module';
import { RequestsModule } from './modules/requests/requests.module';
import { APP_GUARD } from '@nestjs/core';
import { AreasModule } from './modules/areas/areas.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthGuard } from './modules/auth/auth.guard';
import { LoggerMiddleware } from './shared/logger/logger.middleware';

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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
