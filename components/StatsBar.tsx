import { useState, useEffect } from 'react'
import { GoogleSpreadsheet } from 'google-spreadsheet'

const GOOGLE_DOC_ID = process.env.NEXT_PUBLIC_GOOGLE_DOC_ID
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY

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

export default function StatsBar() {
  const [statistics, setStatistics] = useState([null, null, null])
  useEffect(() => {
    async function getData() {
      try {
        const doc = new GoogleSpreadsheet(GOOGLE_DOC_ID, {
          apiKey: GOOGLE_API_KEY,
        })
        await doc.loadInfo()
        const sheet = doc.sheetsByIndex[0]
        await sheet.loadCells('A1:D20')
        const stats = [null, null, null]
        const b1 = sheet.getCell(0, 1).value
        if (typeof b1 == 'number' && Number(b1) > 0) {
          stats[0] = formatNumber(b1)
        }
        const b2 = sheet.getCell(1, 1).value
        if (typeof b2 == 'number' && Number(b2) > 0) {
          stats[1] = `$${formatNumber(b2)}`
        }
        const b3 = sheet.getCell(2, 1).value
        if (typeof b3 == 'number' && Number(b3) > 0) {
          stats[2] = formatNumber(b3)
        }
        setStatistics(stats)
      } catch (e) {
        console.log('Error fetching data from Google sheets: ', e)
      }
    }
    getData()
  }, [])

  const stats = [
    { id: 1, name: 'Grants Given', value: statistics[0] },
    { id: 2, name: 'USD Allocated', value: statistics[1] },
    { id: 3, name: 'Sats sent', value: statistics[2] },
  ]

  return (
    <div className="bg-white py-24 dark:bg-gray-900 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="mx-auto flex max-w-xs flex-col gap-y-4"
            >
              <dt className="text-base/7 text-gray-600 dark:text-gray-300">
                {stat.name}
              </dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
