import React, { useState, useEffect } from 'react'
import PublicGoogleSheetsParser from 'public-google-sheets-parser'

export function formatNumber(num: number): string {
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

const LifetimeStats = () => {
  const [items, setItems] = useState([])

  useEffect(() => {
    const parser = new PublicGoogleSheetsParser(
      '1mLEbHcrJibLN2PKxYq1LHJssq0CGuJRRoaZwot-ncZQ'
    )
    parser.parse().then((data) => {
      setItems(data)
    })
  }, [])

  return (
    <div className="py-4">
      <div className="mx-auto">
        <dl className="grid grid-cols-1 gap-x-2 gap-y-4 md:grid-cols-3">
          {items.map((item, index) => (
            <div key={index} className="mx-auto grid grid-cols-1">
              <dt className="text-center text-base/7 text-gray-600 dark:text-gray-300">
                {item.label}
              </dt>
              <dt className="order-first text-center text-4xl font-semibold tracking-tight text-orange-600">
                {index == 1 ? '$ ' : ''}
                {index == 2 ? '~' : ''}
                {formatNumber(item.value)}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

export default LifetimeStats
