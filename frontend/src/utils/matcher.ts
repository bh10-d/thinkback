import { ReviewResult } from '../types';

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, '').trim();
}

function similarity(a: string, b: string): number {
  const wordsA = new Set(normalize(a).split(/\s+/).filter(Boolean));
  const wordsB = new Set(normalize(b).split(/\s+/).filter(Boolean));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let match = 0;
  wordsA.forEach((w) => { if (wordsB.has(w)) match++; });
  return match / Math.max(wordsA.size, wordsB.size);
}

export function evaluate(userAnswer: string, coreIdea: string): { result: ReviewResult; score: number } {
  const score = similarity(userAnswer, coreIdea);
  if (score > 0.6) return { result: 'remembered', score };
  if (score > 0.3) return { result: 'partially', score };
  return { result: 'forgot', score };
}
