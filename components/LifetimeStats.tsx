import React, { useState, useEffect } from 'react'
import PublicGoogleSheetsParser from 'public-google-sheets-parser'

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
              <h2 className="text-xl font-bold">{item.label}</h2>
              <p className="text-2xl text-blue-600">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LifetimeStats
