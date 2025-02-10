export default function StatsBar({ stats }) {
  const statistics = [
    { id: 1, name: stats.names[0], value: stats.values[0] },
    { id: 2, name: stats.names[1], value: stats.values[1] },
    { id: 3, name: stats.names[2], value: stats.values[2] },
  ]

  return (
    <div className="bg-white py-4 dark:bg-gray-900">
      <div className="mx-auto">
        <dl className="grid grid-cols-1 gap-x-2 gap-y-4 md:grid-cols-3">
          {statistics.map((stat) => (
            <div key={stat.id} className="mx-auto grid grid-cols-1">
              <dt className="text-center text-base/7 text-gray-600 dark:text-gray-300">
                {stat.name}
              </dt>
              <dt className="order-first text-center text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                {stat.value}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
