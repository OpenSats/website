type ProgressProps = {
  percent: number
}

const Progress = ({ percent }: ProgressProps) => {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full bg-gray-200 rounded-full h-4">
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
