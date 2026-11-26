import type { Section, SectionSlug } from './types';

export const sections: readonly Section[] = [
  {
    slug: 'essays',
    title: 'Essays',
    navLabel: 'Essays',
    kicker: '01 · Essays',
    description:
      'Philosophical essays, analytical writing, and criticism. Longer arguments and close readings, kept for slow attention.',
    emptyTitle: 'No essays yet.',
    emptyMessage:
      'New essays and analytical writing will appear here as they are added to the archive.',
  },
  {
    slug: 'notes',
    title: 'Notes',
    navLabel: 'Notes',
    kicker: '02 · Notes',
    description:
      'Short observations, fragments, and working thoughts. The smaller records that gather around a larger argument.',
    emptyTitle: 'No notes yet.',
    emptyMessage:
      'Short reflections, observations, and working notes will appear here as they are written.',
  },
  {
    slug: 'creative-work',
    title: 'Creative Work',
    navLabel: 'Creative Work',
    kicker: '03 · Creative Work',
    description:
      'Stories, imaginative writing, and experiments in form. Fiction and other invented worlds kept alongside the essays.',
    emptyTitle: 'No creative work yet.',
    emptyMessage:
      'Stories and creative pieces will appear here as they are added to the archive.',
  },
  {
    slug: 'library',
    title: 'Library',
    navLabel: 'Library',
    kicker: '04 · Library',
    description:
      'Book reflections and reading notes. A record of what certain books made thinkable, questionable, or newly difficult.',
    emptyTitle: 'No reading notes yet.',
    emptyMessage:
      'Reflections on books and reading will appear here as they are written.',
  },
];

export function getSection(slug: string | undefined): Section | undefined {
  return sections.find((section) => section.slug === slug);
}

export function isSectionSlug(value: string | undefined): value is SectionSlug {
  return sections.some((section) => section.slug === value);
}
