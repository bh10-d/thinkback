import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Controller('topics')
export class TopicsController {
  constructor(private topicsService: TopicsService) {}

  @Post()
  create(@Body() dto: CreateTopicDto) {
    return this.topicsService.create(dto);
  }

  @Get()
  findAll() {
    return this.topicsService.findAll();
  }

  @Patch(':id')
  rename(@Param('id') id: string, @Body() dto: UpdateTopicDto) {
    return this.topicsService.rename(id, dto.name);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Query('mode') mode: 'move' | 'delete' = 'move',
  ) {
    return this.topicsService.remove(id, mode);
  }
}
