import { api } from './client';
import { Topic } from '../types';

export const topicsApi = {
  getAll: () => api.get<Topic[]>('/topics'),
  create: (name: string) => api.post<Topic>('/topics', { name }),
  rename: (id: string, name: string) => api.patch<Topic>(`/topics/${id}`, { name }),
  remove: (id: string, mode: 'move' | 'delete' = 'move') =>
    api.delete<Topic>(`/topics/${id}?mode=${mode}`),
};
