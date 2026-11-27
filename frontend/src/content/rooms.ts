import type { SectionSlug } from './types';
import { getSection } from './sections';

/**
 * Room registry — the single source of truth for URLs, order, chrome copy and
 * palette accents. Everything downstream (router, index, page turn, document
 * titles, per-room accents) reads from here.
 *
 * Canonical paths keep the four legacy slugs so no existing link breaks; the
 * room names are additional aliases (audit A1).
 */

export type RoomId =
  | 'foyer'
  | 'reading-chamber'
  | 'observation-room'
  | 'theatre'
  | 'library'
  | 'cabinet'
  | 'unfinished'
  | 'about';

export type Room = {
  id: RoomId;
  /** canonical path */
  path: string;
  /** additional paths that redirect here */
  aliases: string[];
  /** position in the book — used for page-turn distance and the index */
  index: number;
  /** short label in chrome + index */
  navLabel: string;
  /** room name (from the redesign brief) */
  title: string;
  /** kicker line above the room title */
  kicker: string;
  /** one-line description, used for meta description and the index */
  description: string;
  /** legacy section this room reads from, if any */
  section: SectionSlug | null;
  /** accent used for room chrome, rules and focus details */
  accent: string;
  /** placeholder shown while a room has no content */
  emptyTitle: string;
  emptyMessage: string;
};

const essaySection = getSection('essays');
const notesSection = getSection('notes');
const creativeSection = getSection('creative-work');
const librarySection = getSection('library');

export const rooms: readonly Room[] = [
  {
    id: 'foyer',
    path: '/',
    aliases: [],
    index: 0,
    navLabel: 'Foyer',
    title: 'Foyer',
    kicker: 'The entrance hall',
    description: 'The way in: every room of the archive, and what it holds.',
    section: null,
    accent: '#c9a45f',
    emptyTitle: 'The first page is blank.',
    emptyMessage:
      'New essays, notes, and creative work will appear here as they are written.',
  },
  {
    id: 'reading-chamber',
    path: '/essays',
    aliases: ['/reading-chamber'],
    index: 1,
    navLabel: 'Reading Chamber',
    title: 'Reading Chamber',
    kicker: essaySection?.kicker ?? '01 · Essays',
    description: essaySection?.description ?? '',
    section: 'essays',
    accent: '#8fb2e8',
    emptyTitle: essaySection?.emptyTitle ?? 'No essays yet.',
    emptyMessage: essaySection?.emptyMessage ?? '',
  },
  {
    id: 'observation-room',
    path: '/notes',
    aliases: ['/observation-room'],
    index: 2,
    navLabel: 'Observation Room',
    title: 'Observation Room',
    kicker: notesSection?.kicker ?? '02 · Notes',
    description: notesSection?.description ?? '',
    section: 'notes',
    accent: '#d9a3ae',
    emptyTitle: notesSection?.emptyTitle ?? 'No notes yet.',
    emptyMessage: notesSection?.emptyMessage ?? '',
  },
  {
    id: 'theatre',
    path: '/creative-work',
    aliases: ['/theatre'],
    index: 3,
    navLabel: 'Theatre',
    title: 'Theatre',
    kicker: creativeSection?.kicker ?? '03 · Creative Work',
    description: creativeSection?.description ?? '',
    section: 'creative-work',
    accent: '#e0475c',
    emptyTitle: creativeSection?.emptyTitle ?? 'No creative work yet.',
    emptyMessage: creativeSection?.emptyMessage ?? '',
  },
  {
    id: 'library',
    path: '/library',
    aliases: [],
    index: 4,
    navLabel: 'Library',
    title: 'Library',
    kicker: librarySection?.kicker ?? '04 · Library',
    description: librarySection?.description ?? '',
    section: 'library',
    accent: '#d8b26a',
    emptyTitle: librarySection?.emptyTitle ?? 'No reading notes yet.',
    emptyMessage: librarySection?.emptyMessage ?? '',
  },
  {
    id: 'cabinet',
    path: '/cabinet',
    aliases: [],
    index: 5,
    navLabel: 'Cabinet',
    title: 'Cabinet of Curiosities',
    kicker: '05 · Cabinet',
    description: 'Objects kept for their strangeness, each with a label of its own.',
    section: null,
    accent: '#d9a3ae',
    emptyTitle: 'The drawers are closed.',
    emptyMessage:
      'Curiosities and their handwritten labels will appear here as they are catalogued. TODO: author to supply.',
  },
  {
    id: 'unfinished',
    path: '/unfinished',
    aliases: [],
    index: 6,
    navLabel: 'Unfinished',
    title: 'Unfinished Archive',
    kicker: '06 · Unfinished',
    description: 'Drafts and fragments kept as they are: partial, marked, in progress.',
    section: null,
    accent: '#e0475c',
    emptyTitle: 'Nothing is pinned up yet.',
    emptyMessage:
      'Drafts, fragments and stalled pieces will be pinned here as they are set down. TODO: author to supply.',
  },
  {
    id: 'about',
    path: '/about',
    aliases: [],
    index: 7,
    navLabel: 'About',
    title: 'About',
    kicker: 'About the archive',
    description:
      'What this archive is for, and the biographical note the author supplies.',
    section: null,
    accent: '#c9a45f',
    emptyTitle: 'A biographical note will appear here.',
    emptyMessage:
      'This space is reserved for the author’s own account of their work and intellectual life. No biography has been invented for it.',
  },
];

const byId = new Map<string, Room>(rooms.map((room) => [room.id, room]));
const bySegment = new Map<string, Room>();
for (const room of rooms) {
  bySegment.set(room.path === '/' ? '' : room.path.slice(1), room);
  for (const alias of room.aliases) bySegment.set(alias.slice(1), room);
}

export function getRoom(id: string | undefined | null): Room | undefined {
  return id ? byId.get(id) : undefined;
}

export function getRoomByIndex(index: number): Room | undefined {
  return rooms.find((room) => room.index === index);
}

/** Canonical path for a path that may be an alias (or a reading view path). */
export function normalizePath(pathname: string): string {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const room = getRoomBySegment(clean);
  return room ? room.path : clean;
}

export function getRoomByPath(pathname: string): Room | undefined {
  return bySegment.get(normalizePath(pathname) === '/' ? '' : normalizePath(pathname).slice(1));
}

/** First path segment, mapped to a room (aliases included). */
export function getRoomBySegment(segment: string): Room | undefined {
  const clean = segment.replace(/^\/+|\/+$/g, '');
  if (!clean) return bySegment.get('');
  return bySegment.get(clean);
}

/**
 * The room a path belongs to — including reading views (`/essays/some-slug`).
 * Returns null for unknown paths (404).
 */
export function roomKeyForPath(pathname: string): RoomId | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return 'foyer';
  const room = getRoomBySegment(segments[0]);
  if (!room) return null;
  if (segments.length === 1) return room.id;
  // a reading view only exists inside a room that has a content section
  return room.section ? room.id : null;
}

/** Split a reading-view path into room + slug. */
export function parseReadingPath(
  pathname: string,
): { roomId: RoomId; section: SectionSlug; slug: string } | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length !== 2) return null;
  const room = getRoomBySegment(segments[0]);
  if (!room?.section) return null;
  return { roomId: room.id, section: room.section, slug: segments[1] };
}

export function pathForRoom(id: RoomId): string {
  return getRoom(id)?.path ?? '/';
}

/** Neighbouring room in the book order; null at the ends. */
export function adjacentRoomPath(id: RoomId, delta: 1 | -1): string | null {
  const room = getRoom(id);
  if (!room) return null;
  const target = getRoomByIndex(room.index + delta);
  return target ? target.path : null;
}

export function roomDistance(fromId: RoomId, toId: RoomId): number {
  const from = getRoom(fromId);
  const to = getRoom(toId);
  if (!from || !to) return 1;
  return Math.abs(from.index - to.index);
}

/**
 * How many leaves to turn for a jump. A long jump still reads as "several
 * pages in quick succession" but never takes longer than a moment.
 */
export function flipsFor(distance: number): number {
  if (distance <= 1) return 1;
  return Math.min(3, distance);
}

/* --- history direction ---------------------------------------------------- */

/** `window.history.state.idx` is maintained by react-router. */
export function readHistoryIndex(state: unknown): number | null {
  if (state && typeof state === 'object' && 'idx' in state) {
    const idx = (state as { idx?: unknown }).idx;
    if (typeof idx === 'number') return idx;
  }
  return null;
}

/** +1 when moving forward through history, -1 when going back. */
export function directionFor(
  previousIndex: number | null,
  nextIndex: number | null,
): 1 | -1 {
  if (previousIndex === null || nextIndex === null) return 1;
  return nextIndex >= previousIndex ? 1 : -1;
}

/** Per-room document title (fallback to the site masthead). */
export function documentTitleFor(room: Room | undefined, masthead: string): string {
  if (!room) return `Page not found — ${masthead}`;
  if (room.id === 'foyer') return `${masthead} — A personal archive of thought, writing, and creative work`;
  if (room.id === 'about') return `About — ${masthead}`;
  return `${room.title} — ${masthead}`;
}
