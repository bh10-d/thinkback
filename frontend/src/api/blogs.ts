import { api } from './client';
import { Blog } from '../types';

export interface CreateBlogPayload {
  title: string;
  content?: string;
  topicId?: string;
}

export interface UpdateBlogPayload {
  title?: string;
  content?: string;
  topicId?: string;
  isPublic?: boolean;
}

export const blogsApi = {
  getAll: () => api.get<Blog[]>('/blogs'),
  getById: (id: string) => api.get<Blog>(`/blogs/${id}`),
  getBySlug: (slug: string) => api.get<Blog>(`/public/blogs/${slug}`),
  create: (payload: CreateBlogPayload) => api.post<Blog>('/blogs', payload),
  update: (id: string, payload: UpdateBlogPayload) => api.patch<Blog>(`/blogs/${id}`, payload),
  remove: (id: string) => api.delete<Blog>(`/blogs/${id}`),
};
