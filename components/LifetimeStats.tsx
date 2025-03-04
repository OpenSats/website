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
    <div className="bg-gray-100 p-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <div key={index} className="rounded-lg bg-white p-4 shadow-md">
              <h2 className="text-2xl font-bold text-orange-600">
                ~{formatNumber(item.value)}
              </h2>
              <p className="text-l">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LifetimeStats
