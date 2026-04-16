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

export interface NotesListParams {
  limit?: number;
  cursor?: string;
  search?: string;
  topicId?: string;
}

export interface NotesListResponse {
  data: Note[];
  nextCursor: string | null;
}

export const notesApi = {
  getAll: (params: NotesListParams = {}) => {
    const qs = new URLSearchParams();
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.cursor) qs.set('cursor', params.cursor);
    if (params.search) qs.set('search', params.search);
    if (params.topicId) qs.set('topicId', params.topicId);
    const query = qs.toString();
    return api.get<NotesListResponse>(`/notes${query ? `?${query}` : ''}`);
  },
  getToday: (topicId?: string) =>
    api.get<TodayResponse>(topicId ? `/notes/today?topicId=${topicId}` : '/notes/today'),
  getById: (id: string) => api.get<Note>(`/notes/${id}`),
  create: (payload: CreateNotePayload) => api.post<Note>('/notes', payload),
  update: (id: string, payload: UpdateNotePayload) => api.patch<Note>(`/notes/${id}`, payload),
  remove: (id: string) => api.delete<Note>(`/notes/${id}`),
};
