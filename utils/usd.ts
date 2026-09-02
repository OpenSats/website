export function parseUsd(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined
  }
  if (typeof value !== 'string') return undefined

  const cleaned = value.replace(/[^0-9.]/g, '')
  if (!cleaned || cleaned === '.') return undefined

  const [whole, ...rest] = cleaned.split('.')
  const normalized = rest.length
    ? `${whole || '0'}.${rest.join('').slice(0, 2)}`
    : whole
  const amount = Number(normalized)
  return Number.isFinite(amount) ? amount : undefined
}

export function formatUsd(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })
}

export function formatUsdDisplay(value: unknown): string {
  const amount = parseUsd(value)
  if (amount === undefined) return ''
  return `$${formatUsd(amount)}`
}
