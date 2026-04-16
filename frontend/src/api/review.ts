import { api } from './client';
import { Note, ReviewResult } from '../types';

export const reviewApi = {
  submit: (noteId: string, result: ReviewResult) =>
    api.post<Note>('/review', { noteId, result }),
};
