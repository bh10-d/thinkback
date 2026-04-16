import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { BlogsModule } from '../blogs/blogs.module';

@Module({
  imports: [BlogsModule],
  controllers: [PublicController],
})
export class PublicModule {}
