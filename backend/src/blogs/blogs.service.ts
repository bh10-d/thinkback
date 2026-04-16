import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80) || 'untitled';
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 7);
}

@Injectable()
export class BlogsService {
  constructor(private prisma: PrismaService) {}

  private async uniqueSlug(base: string): Promise<string> {
    let slug = base;
    while (await this.prisma.blog.findUnique({ where: { slug } })) {
      slug = `${base}-${randomSuffix()}`;
    }
    return slug;
  }

  async create(dto: CreateBlogDto) {
    const baseSlug = generateSlug(dto.title);
    const slug = await this.uniqueSlug(baseSlug);
    return this.prisma.blog.create({
      data: { ...dto, content: dto.content ?? '', slug, isPublic: false },
      include: { topic: true },
    });
  }

  async findAll() {
    return this.prisma.blog.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { topic: true },
    });
  }

  async findOne(id: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      include: { topic: true },
    });
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

  async findBySlug(slug: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { slug },
      include: { topic: true },
    });
    if (!blog) throw new NotFoundException('Blog not found');
    if (!blog.isPublic) throw new NotFoundException('Blog not found');
    return blog;
  }

  async update(id: string, dto: UpdateBlogDto) {
    await this.findOne(id);
    return this.prisma.blog.update({
      where: { id },
      data: dto,
      include: { topic: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.blog.delete({ where: { id } });
  }
}
