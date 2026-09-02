// Closed during the third month of each quarter (Mar, Jun, Sep, Dec).
export function areApplicationsOpen(date = new Date()): boolean {
  return date.getMonth() % 3 !== 2
}

export function isVercelPreview(): boolean {
  return (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' ||
    process.env.VERCEL_ENV === 'preview'
  )
}

export function showGrantApplicationForm(): boolean {
  return areApplicationsOpen() || isVercelPreview()
}
