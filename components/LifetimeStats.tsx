import React from 'react'
import {
  formatLifetimeStatDisplay,
  useAnimatedLifetimeStats,
} from '@/utils/lifetimeStats'

const LifetimeStats = () => {
  const items = useAnimatedLifetimeStats()

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
                {formatLifetimeStatDisplay(index, item.value)}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

export default LifetimeStats
