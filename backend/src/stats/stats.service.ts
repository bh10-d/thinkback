import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface StreakResult {
  streakCount: number;
  lastReviewDate: string | null;
}

export interface HeatmapEntry {
  date: string;
  count: number;
}

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getStreak(): Promise<StreakResult> {
    const logs = await this.prisma.dailyReview.findMany({
      where: { count: { gt: 0 } },
      orderBy: { date: 'desc' },
      take: 400,
    });

    if (logs.length === 0) return { streakCount: 0, lastReviewDate: null };

    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const mostRecent = logs[0].date;

    // Streak is broken if most recent review is before yesterday
    if (mostRecent !== today && mostRecent !== yesterday) {
      return { streakCount: 0, lastReviewDate: mostRecent };
    }

    let streak = 0;
    let expected = mostRecent;

    for (const log of logs) {
      if (log.date === expected) {
        streak++;
        const d = new Date(expected + 'T12:00:00Z');
        d.setUTCDate(d.getUTCDate() - 1);
        expected = d.toISOString().slice(0, 10);
      } else {
        break;
      }
    }

    return { streakCount: streak, lastReviewDate: mostRecent };
  }

  async getHeatmap(days = 90): Promise<HeatmapEntry[]> {
    const result: HeatmapEntry[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      result.push({ date: d.toISOString().slice(0, 10), count: 0 });
    }

    const startDate = result[0].date;
    const logs = await this.prisma.dailyReview.findMany({
      where: { date: { gte: startDate } },
    });

    const logMap = new Map(logs.map((l) => [l.date, l.count]));
    return result.map((day) => ({
      date: day.date,
      count: logMap.get(day.date) ?? 0,
    }));
  }
}
