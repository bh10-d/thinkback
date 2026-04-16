import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitReviewDto, ReviewResult } from './dto/submit-review.dto';

const LEVEL_DAYS = [1, 3, 7, 14, 30];
const MAX_LEVEL = LEVEL_DAYS.length - 1;

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getNextReview(level: number, result: ReviewResult) {
  const now = new Date();
  if (result === 'remembered') {
    const newLevel = Math.min(level + 1, MAX_LEVEL);
    return { newLevel, nextReviewAt: addDays(now, LEVEL_DAYS[newLevel]) };
  }
  if (result === 'partially') {
    return { newLevel: level, nextReviewAt: addDays(now, 1) };
  }
  return { newLevel: 0, nextReviewAt: addDays(now, 1) };
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async submit(dto: SubmitReviewDto) {
    const note = await this.prisma.note.findUnique({ where: { id: dto.noteId } });
    if (!note) throw new NotFoundException('Note not found');

    const { newLevel, nextReviewAt } = getNextReview(note.reviewLevel, dto.result);

    const [updatedNote] = await this.prisma.$transaction([
      this.prisma.note.update({
        where: { id: dto.noteId },
        data: { reviewLevel: newLevel, nextReviewAt, lastReviewedAt: new Date() },
      }),
      this.prisma.dailyReview.upsert({
        where: { date: todayStr() },
        create: { date: todayStr(), count: 1 },
        update: { count: { increment: 1 } },
      }),
    ]);

    return updatedNote;
  }
}
