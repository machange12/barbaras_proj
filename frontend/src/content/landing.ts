export type LandingPrinciple = {
  title: string;
  body: string;
};

export type LandingBook = {
  slug: string;
  title: string;
  author: string;
  detail: string;
  meta: string;
  accent: string;
  discussionFocus: string;
};

export type LandingArchiveEntry = {
  title: string;
  detail: string;
};

export type LandingDebate = {
  title: string;
  status: string;
  body: string;
};

export type LandingEssay = {
  title: string;
  blurb: string;
};

export type LandingEvent = {
  title: string;
  detail: string;
};

export const principles: ReadonlyArray<LandingPrinciple> = [
  {
    title: 'Books as instruments',
    body: 'We read to sharpen judgment, not to collect summaries.',
  },
  {
    title: 'Conversation as craft',
    body: "A salon rewards precision, generosity, and the rare discipline of changing one's mind.",
  },
  {
    title: 'Culture in public',
    body: 'Philosophy, politics, economics, and art are treated as one continuous argument.',
  },
];

export const readingBooks: ReadonlyArray<LandingBook> = [
  {
    slug: 'the-social-contract',
    title: 'The Social Contract',
    author: 'Jean-Jacques Rousseau',
    detail: 'The terms of civic life, written with an almost architectural calm.',
    meta: 'Current reading - 2 weeks',
    accent: 'from-[#5c4033] to-[#2b1e17]',
    discussionFocus:
      'How does consent become legitimate authority, and where does the argument strain under the pressure of real civic life?',
  },
  {
    slug: 'the-wealth-of-nations',
    title: 'The Wealth of Nations',
    author: 'Adam Smith',
    detail: 'A study of exchange, appetite, and the quiet order of markets.',
    meta: 'Discussion notes - Thursday',
    accent: 'from-[#3e2a1f] to-[#1f2a2e]',
    discussionFocus:
      'What moral assumptions sit underneath market order, and how should a reader notice them without flattening the book into economics alone?',
  },
  {
    slug: 'the-birth-of-tragedy',
    title: 'The Birth of Tragedy',
    author: 'Friedrich Nietzsche',
    detail: 'An inquiry into form, ritual, and the making of modern feeling.',
    meta: 'Essay circle - Next week',
    accent: 'from-[#3b1f1f] to-[#2b1e17]',
    discussionFocus:
      'What does tragedy preserve that rational explanation cannot, and why does Nietzsche make art carry so much philosophical weight?',
  },
  {
    slug: 'the-history-of-the-peloponnesian-war',
    title: 'The History of the Peloponnesian War',
    author: 'Thucydides',
    detail: 'A reminder that public argument survives by discipline and memory.',
    meta: 'Archive note - Reserved',
    accent: 'from-[#5c4033] to-[#3e2a1f]',
    discussionFocus:
      'How do ambition, fear, and public speech shape political collapse when institutions are placed under extreme strain?',
  },
];

export const archiveEntries: ReadonlyArray<LandingArchiveEntry> = [
  {
    title: 'Catalog 12',
    detail: 'Letters, receipts, and reading lists from the salon archive room.',
  },
  {
    title: 'Manuscript Drawer',
    detail: 'Short reflections published for members before the next gathering.',
  },
  {
    title: 'Reference Shelf',
    detail: 'Historical guides to etiquette, philosophy, and public debate.',
  },
];

export const debateItems: ReadonlyArray<LandingDebate> = [
  {
    title: 'On the Use of Public Disagreement',
    status: 'Open',
    body: 'A room for careful objections and the kind of argument that improves the mind.',
  },
  {
    title: 'The Ethics of Patronage',
    status: 'Sealed',
    body: 'Archived for later review after a full round of notes and responses.',
  },
];

export const essayItems: ReadonlyArray<LandingEssay> = [
  {
    title: 'How a room makes thought possible',
    blurb: 'A note on the social architecture of serious reading.',
  },
  {
    title: 'Reading notes from the winter table',
    blurb: 'Marginalia, recorded objections, and small acts of attention.',
  },
];

export const eventItems: ReadonlyArray<LandingEvent> = [
  {
    title: 'Salon Evening - March 18',
    detail: 'A guided discussion on political friendship and the price of loyalty.',
  },
  {
    title: 'Reading Circle - April 2',
    detail: 'A slow reading of selected passages from civic and literary essays.',
  },
];

export const readingPrompts: ReadonlyArray<string> = [
  'What question does this author ask but never fully answer?',
  'Which passage feels most like a public argument, and why?',
  'Where does the text invite you to disagree?',
];
