import { api } from './client';
import { Note, TodayResponse } from '../types';

export interface CreateNotePayload {
  title: string;
  questions: string[];
  coreIdea: string;
  mistake: string;
  example: string;
  topicId?: string;
}

export interface UpdateNotePayload {
  title?: string;
  questions?: string[];
  coreIdea?: string;
  mistake?: string;
  example?: string;
  topicId?: string;
}

export const notesApi = {
  getAll: () => api.get<Note[]>('/notes'),
  getToday: (topicId?: string) =>
    api.get<TodayResponse>(topicId ? `/notes/today?topicId=${topicId}` : '/notes/today'),
  getById: (id: string) => api.get<Note>(`/notes/${id}`),
  create: (payload: CreateNotePayload) => api.post<Note>('/notes', payload),
  update: (id: string, payload: UpdateNotePayload) => api.patch<Note>(`/notes/${id}`, payload),
  remove: (id: string) => api.delete<Note>(`/notes/${id}`),
};
