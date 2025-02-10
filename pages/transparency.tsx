import { InferGetStaticPropsType } from 'next'
import { allPages } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'
import { JWT } from 'google-auth-library'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import StatsBar from '@/components/StatsBar'

const DEFAULT_LAYOUT = 'PageLayout'
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? ''
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY ?? ''
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/drive.file',
]

const jwtFromEnv = new JWT({
  email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: SCOPES,
})

function formatNumber(num: number): string {
  const abbreviations = ['k', 'M', 'B', 'T']
  let i = 0
  while (num > 1e3 && i < abbreviations.length) {
    num /= 1e3
    if (num < 1e3) {
      return `${num.toFixed(1)} ${abbreviations[i]}`
    }
    i += 1
  }
  return num.toString()
}

export const getStaticProps = async () => {
  const page = allPages.find((p) => p.slug === 'transparency')
  const statValues = ['', '', '']
  const statNames = ['', '', '']
  try {
    const doc = new GoogleSpreadsheet(
      '1zSno0B3PntjRO0DVrDdkBHJOzGGtfJItzk37bzIzR7U',
      jwtFromEnv
    )
    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[0]
    await sheet.loadCells('A1:D20')
    const b = [
      sheet.getCell(0, 1).value,
      sheet.getCell(1, 1).value,
      sheet.getCell(2, 1).value,
    ]
    const a = [
      sheet.getCell(0, 0).value,
      sheet.getCell(1, 0).value,
      sheet.getCell(2, 0).value,
    ]
    if (typeof b[0] == 'number' && Number(b[0]) > 0) {
      statValues[0] = formatNumber(b[0])
      if (typeof a[0] == 'string') statNames[0] = a[0].replace(':', '')
    }
    if (typeof b[1] == 'number' && Number(b[1]) > 0) {
      statValues[1] = `$${formatNumber(b[1])}`
      if (typeof a[1] == 'string') statNames[1] = a[1].replace(':', '')
    }
    if (typeof b[2] == 'number' && Number(b[2]) > 0) {
      statValues[2] = formatNumber(b[2])
      if (typeof a[2] == 'string') statNames[2] = a[2].replace(':', '')
    }
  } catch (e) {
    console.log('Error fetching data from Google sheets: ', e)
  }
  return {
    props: {
      page: page,
      stats: {
        values: statValues,
        names: statNames,
      },
    },
  }
}

export default function Transparency({
  page,
  stats,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <StatsBar stats={stats} />
      <MDXLayoutRenderer
        layout={page.layout || DEFAULT_LAYOUT}
        content={page}
        MDXComponents={MDXComponents}
      />
    </>
  )
}
