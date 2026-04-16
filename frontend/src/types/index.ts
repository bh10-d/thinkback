export interface Topic {
  id: string;
  name: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  questions: string[];
  coreIdea: string;
  mistake: string;
  example: string;
  topicId: string | null;
  topic: Topic | null;
  reviewLevel: number;
  nextReviewAt: string;
  lastReviewedAt: string | null;
  createdAt: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  slug: string;
  isPublic: boolean;
  topicId: string | null;
  topic: Topic | null;
  createdAt: string;
  updatedAt: string;
}

export type ReviewResult = 'remembered' | 'partially' | 'forgot';

export interface TodayResponse {
  notes: Note[];
  count: number;
}
