import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Controller('notes')
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Post()
  create(@Body() dto: CreateNoteDto) {
    return this.notesService.create(dto);
  }

  // 'today' must stay before ':id'
  @Get('today')
  findToday(@Query('topicId') topicId?: string) {
    return this.notesService.findToday(topicId);
  }

  @Get()
  findAll(
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
    @Query('search') search?: string,
    @Query('topicId') topicId?: string,
  ) {
    return this.notesService.findAll({
      limit: limit ? parseInt(limit, 10) : 20,
      cursor,
      search,
      topicId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNoteDto) {
    return this.notesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notesService.remove(id);
  }
}
