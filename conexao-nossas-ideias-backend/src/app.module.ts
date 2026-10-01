import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './shared/database/database.module';
import { RequestsModule } from './modules/requests/requests.module';

@Module({
  imports: [DatabaseModule, RequestsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
