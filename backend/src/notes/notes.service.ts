import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNoteDto) {
    return this.prisma.note.create({
      data: { ...dto, reviewLevel: 0, nextReviewAt: new Date() },
      include: { topic: true },
    });
  }

  async findAll() {
    return this.prisma.note.findMany({
      orderBy: { createdAt: 'desc' },
      include: { topic: true },
    });
  }

  async findOne(id: string) {
    const note = await this.prisma.note.findUnique({
      where: { id },
      include: { topic: true },
    });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async findToday(topicId?: string) {
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const where: Record<string, unknown> = { nextReviewAt: { lte: todayEnd } };
    if (topicId) where.topicId = topicId;

    const due = await this.prisma.note.findMany({
      where,
      orderBy: { nextReviewAt: 'asc' },
      include: { topic: true },
    });
    return { notes: due, count: due.length };
  }

  async update(id: string, dto: UpdateNoteDto) {
    await this.findOne(id);
    return this.prisma.note.update({
      where: { id },
      data: dto,
      include: { topic: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.note.delete({ where: { id } });
  }
}
