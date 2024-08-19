type ProgressProps = {
  percent: number
}

const Progress = ({ percent }: ProgressProps) => {
  return (
    <div className="w-full flex flex-col items-center space-y-2">
      <div className="w-full bg-primary/15 rounded-full h-4">
        <div
          className="bg-green-500 h-4 rounded-full text-xs"
          style={{ width: `${percent}%` }}
        ></div>
      </div>

      <span className="text-sm font-semibold">{percent}%</span>
    </div>
  )
}

export default Progress
