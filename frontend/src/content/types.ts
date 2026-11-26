export type SectionSlug = 'essays' | 'notes' | 'creative-work' | 'library';

export type WritingEntry = {
  slug: string;
  title: string;
  section: SectionSlug;
  date: string;
  summary?: string;
  tags?: string[];
  featured?: boolean;
  readingTime?: string;
  body: string;
};

export type Section = {
  slug: SectionSlug;
  title: string;
  navLabel: string;
  kicker: string;
  description: string;
  emptyTitle: string;
  emptyMessage: string;
};
