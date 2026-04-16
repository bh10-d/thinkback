import { api } from './client';

export interface StreakResponse {
  streakCount: number;
  lastReviewDate: string | null;
}

export interface HeatmapEntry {
  date: string;
  count: number;
}

export const statsApi = {
  getStreak: () => api.get<StreakResponse>('/stats/streak'),
  getHeatmap: (days = 90) => api.get<HeatmapEntry[]>(`/stats/heatmap?days=${days}`),
};
