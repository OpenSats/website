import { qualifiesForHumanBadge } from './humanWriting'

it.each([85, 85.001, 95, 99.74755644798279, 100])(
  'qualifies a human-written score of %s',
  (score) => expect(qualifiesForHumanBadge(score)).toBe(true)
)

it.each([undefined, 0, 84, 84.999999, 100.01, -1, NaN, Infinity])(
  'does not qualify missing, below-threshold, or invalid score %s',
  (score) => expect(qualifiesForHumanBadge(score)).toBe(false)
)
