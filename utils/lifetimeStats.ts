import PublicGoogleSheetsParser from 'public-google-sheets-parser'

export type LifetimeStat = { label: string; value: number }

export const LIFETIME_STATS_SHEET_ID =
  '1mLEbHcrJibLN2PKxYq1LHJssq0CGuJRRoaZwot-ncZQ'

/**
 * Fetches the OpenSats lifetime stats sheet (grants given, USD allocated,
 * sats sent) from Google Sheets. Returns null when the sheet is unreachable
 * so that build pipelines never fail on a transient network blip — the
 * client-side refresh inside `<StatsSentence />` will fill in the numbers
 * after hydration.
 */
export async function getLifetimeStats(): Promise<LifetimeStat[] | null> {
  try {
    const parser = new PublicGoogleSheetsParser(LIFETIME_STATS_SHEET_ID)
    const data = (await parser.parse()) as LifetimeStat[]
    return Array.isArray(data) && data.length > 0 ? data : null
  } catch {
    return null
  }
}
