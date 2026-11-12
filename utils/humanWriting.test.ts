import { qualifiesForHumanBadge } from './humanWriting'

it.each([95, 95.001, 99.74755644798279, 100])(
  'qualifies a human-written score of %s',
  (score) => expect(qualifiesForHumanBadge(score)).toBe(true)
)

it.each([undefined, 0, 94, 94.999999, 100.01, -1, NaN, Infinity])(
  'does not qualify missing, below-threshold, or invalid score %s',
  (score) => expect(qualifiesForHumanBadge(score)).toBe(false)
)
