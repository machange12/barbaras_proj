export type SalonTimelineEntry = {
  period: string
  title: string
  body: string
}

export type SalonInfluence = {
  discipline: string
  body: string
}

export const salonTimeline: SalonTimelineEntry[] = [
  {
    period: 'Early seventeenth century',
    title: 'The room becomes an institution',
    body: 'French salons emerged from aristocratic and literary households where conversation was treated as a social art. The hostess shaped the room, selected guests, and set expectations for wit, restraint, and seriousness.',
  },
  {
    period: 'Eighteenth century',
    title: 'Enlightenment thought finds a public rhythm',
    body: 'The salon became a meeting ground for writers, philosophers, scientists, diplomats, and patrons. Ideas moved through letters, manuscripts, readings, and arguments before they entered books or institutions.',
  },
  {
    period: 'Revolutionary century',
    title: 'Conversation presses against power',
    body: 'Salons did not cause the French Revolution, but they helped normalize the habit of examining authority in company. Politics became discussable, contestable, and increasingly public.',
  },
  {
    period: 'Modern inheritance',
    title: 'A model for serious sociability',
    body: 'The lasting lesson is not nostalgia for aristocratic rooms. It is the possibility of building disciplined spaces where reading, friendship, disagreement, and culture deepen one another.',
  },
]

export const salonInfluences: SalonInfluence[] = [
  {
    discipline: 'Politics',
    body: 'Salons made power an object of conversation. They gave political ideas a social setting before those ideas became programs, slogans, or institutions.',
  },
  {
    discipline: 'Philosophy',
    body: 'Philosophical arguments were tested aloud, refined by objection, and made legible to people outside universities and clerical institutions.',
  },
  {
    discipline: 'Economics',
    body: 'Questions of commerce, luxury, taxation, property, and reform circulated alongside moral philosophy, making economic life part of intellectual culture.',
  },
  {
    discipline: 'Culture',
    body: 'Taste, literature, theater, criticism, and manners were not treated as decoration. They were understood as forces that shape public life.',
  },
]
