import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormconfig from './ormconfig'
import { TagModule } from './tag/tag.module';

@Module({
  imports: [TypeOrmModule.forRoot(ormconfig) , TagModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
