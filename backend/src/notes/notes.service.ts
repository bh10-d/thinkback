import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

export interface NotesListParams {
  limit?: number;
  cursor?: string;   // ISO string of createdAt of last note fetched
  search?: string;   // search title + coreIdea
  topicId?: string;
}

export interface NotesListResult {
  data: object[];
  nextCursor: string | null;
}

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNoteDto) {
    return this.prisma.note.create({
      data: { ...dto, reviewLevel: 0, nextReviewAt: new Date() },
      include: { topic: true },
    });
  }

  async findAll(params: NotesListParams = {}): Promise<NotesListResult> {
    const { limit = 20, cursor, search, topicId } = params;

    const where: Record<string, unknown> = {};

    if (topicId) where.topicId = topicId;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { coreIdea: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (cursor) {
      where.createdAt = { lt: new Date(cursor) };
    }

    const notes = await this.prisma.note.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      include: { topic: true },
    });

    let nextCursor: string | null = null;
    if (notes.length > limit) {
      notes.pop();
      nextCursor = notes[notes.length - 1].createdAt.toISOString();
    }

    return { data: notes, nextCursor };
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
