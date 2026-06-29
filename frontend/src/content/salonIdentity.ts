export type SalonDistinction = {
  ordinary: string
  salon: string
}

export type SalonPractice = {
  title: string
  body: string
}

export const salonDistinctions: SalonDistinction[] = [
  {
    ordinary: 'A book club often begins with whether people liked the book.',
    salon: 'A salon begins with what the book makes thinkable, questionable, or newly difficult.',
  },
  {
    ordinary: 'A book club may reward completion.',
    salon: 'A salon rewards attention, preparation, interpretation, and the quality of one\'s questions.',
  },
  {
    ordinary: 'A book club usually stays near plot, theme, and personal reaction.',
    salon: 'A salon lets literature touch politics, economics, theology, manners, art, and public life.',
  },
  {
    ordinary: 'A book club can treat disagreement as social friction.',
    salon: 'A salon treats disagreement as a craft that requires restraint, curiosity, and intellectual courage.',
  },
]

export const salonPractices: SalonPractice[] = [
  {
    title: 'Prepared presence',
    body: 'Members arrive with marked passages, live questions, and a willingness to be changed by the room.',
  },
  {
    title: 'Disciplined disagreement',
    body: 'The strongest objection is offered in a way that helps the other person think more clearly.',
  },
  {
    title: 'Written afterlife',
    body: 'Conversations become notes, essays, summaries, prompts, and future debates instead of vanishing when the evening ends.',
  },
  {
    title: 'Civic imagination',
    body: 'Books are read as entrances into the shared world, not as private entertainment alone.',
  },
]
