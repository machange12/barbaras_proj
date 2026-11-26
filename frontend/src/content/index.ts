import { creativeWork } from './entries/creativeWork';
import { essays } from './entries/essays';
import { library } from './entries/library';
import { notes } from './entries/notes';
import type { SectionSlug, WritingEntry } from './types';

export { getSection, isSectionSlug, sections } from './sections';
export { site } from './site';
export type { Section, SectionSlug, WritingEntry } from './types';

const entriesBySection: Record<SectionSlug, readonly WritingEntry[]> = {
  essays,
  notes,
  'creative-work': creativeWork,
  library,
};

export const allEntries: readonly WritingEntry[] = [
  ...essays,
  ...notes,
  ...creativeWork,
  ...library,
];

function byDateDescending(a: WritingEntry, b: WritingEntry): number {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

export function getEntriesBySection(section: SectionSlug): WritingEntry[] {
  return [...entriesBySection[section]].sort(byDateDescending);
}

export function getEntry(section: SectionSlug, slug: string): WritingEntry | undefined {
  return entriesBySection[section].find((entry) => entry.slug === slug);
}

export function getRecentEntries(limit = 5): WritingEntry[] {
  return [...allEntries].sort(byDateDescending).slice(0, limit);
}

export function getFeaturedEntry(): WritingEntry | undefined {
  return allEntries.find((entry) => entry.featured) ?? getRecentEntries(1)[0];
}

export function getAdjacentEntries(
  section: SectionSlug,
  slug: string,
): { previous?: WritingEntry; next?: WritingEntry } {
  const entries = getEntriesBySection(section);
  const index = entries.findIndex((entry) => entry.slug === slug);

  if (index === -1) {
    return {};
  }

  return {
    previous: entries[index + 1],
    next: entries[index - 1],
  };
}
