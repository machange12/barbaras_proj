import type { WritingEntry } from '../content/types';

export function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function countWords(body: string): number {
  return body
    .split(/\s+/)
    .filter((word) => /[A-Za-z0-9]/.test(word)).length;
}

export function getReadingTime(entry: WritingEntry): string | undefined {
  if (entry.readingTime) {
    return entry.readingTime;
  }

  const words = countWords(entry.body);

  if (words === 0) {
    return undefined;
  }

  const minutes = Math.max(1, Math.ceil(words / 220));
  return `${minutes} min read`;
}
