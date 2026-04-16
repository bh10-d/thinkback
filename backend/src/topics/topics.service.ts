import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';

@Injectable()
export class TopicsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTopicDto) {
    const existing = await this.prisma.topic.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Topic already exists');
    return this.prisma.topic.create({ data: dto });
  }

  async findAll() {
    return this.prisma.topic.findMany({ orderBy: { name: 'asc' } });
  }

  async remove(id: string) {
    const topic = await this.prisma.topic.findUnique({ where: { id } });
    if (!topic) throw new NotFoundException('Topic not found');
    // Unlink notes before deleting
    await this.prisma.note.updateMany({ where: { topicId: id }, data: { topicId: null } });
    return this.prisma.topic.delete({ where: { id } });
  }
}
