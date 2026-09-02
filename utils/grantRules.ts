import { parseUsd } from './usd'

const VIDEO_REQUIRED_USD = 21_000

/** Video is required on general grants of $21k or more. LTS and RED skip it. */
export function isVideoRequired(application: {
  LTS?: unknown
  RED?: unknown
  grand_total?: unknown
}): boolean {
  if (application.LTS || application.RED) return false
  const amount = parseUsd(application.grand_total)
  return amount !== undefined && amount >= VIDEO_REQUIRED_USD
}
