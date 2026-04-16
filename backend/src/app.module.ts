import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { NotesModule } from './notes/notes.module';
import { ReviewModule } from './review/review.module';
import { TopicsModule } from './topics/topics.module';
import { BlogsModule } from './blogs/blogs.module';
import { PublicModule } from './public/public.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    PrismaModule,
    NotesModule,
    ReviewModule,
    TopicsModule,
    BlogsModule,
    PublicModule,
    StatsModule,
  ],
})
export class AppModule {}
