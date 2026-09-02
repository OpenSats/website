import { formatUsdDisplay, parseUsd } from './usd'

export const VIDEO_REQUIRED_USD = 21_000
export const VIDEO_REQUIRED_LABEL = formatUsdDisplay(VIDEO_REQUIRED_USD)

export function isVideoRequired(grandTotal: unknown): boolean {
  const amount = parseUsd(grandTotal)
  return amount !== undefined && amount >= VIDEO_REQUIRED_USD
}
