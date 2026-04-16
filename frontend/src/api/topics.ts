import { api } from './client';
import { Topic } from '../types';

export const topicsApi = {
  getAll: () => api.get<Topic[]>('/topics'),
  create: (name: string) => api.post<Topic>('/topics', { name }),
  remove: (id: string) => api.delete<Topic>(`/topics/${id}`),
};
