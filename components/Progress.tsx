type ProgressProps = { current: number; goal: number }

const Progress = ({ current, goal }: ProgressProps) => {
  const percent = Math.floor((current / goal) * 100)

  return (
    <div className="w-full flex flex-col items-center space-y-1">
      <div className="w-full h-4 bg-primary/15 rounded-full overflow-hidden">
        <div
          className="bg-green-500 h-4 rounded-full text-xs"
          style={{ width: `${percent < 100 ? percent : 100}%` }}
        />
      </div>

      <span className="text-sm font-semibold">{percent < 100 ? percent : 100}%</span>
    </div>
  )
}

export default Progress
