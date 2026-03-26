interface Step {
  id: string
  title: string
}

interface StepIndicatorProps {
  steps: readonly Step[]
  currentStep: number
}

export default function StepIndicator({
  steps,
  currentStep,
}: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className="mb-4">
      <ol className="flex items-center justify-center gap-3">
        {steps.map((step, i) => {
          const isCompleted = i < currentStep
          const isCurrent = i === currentStep
          return (
            <li key={step.id} className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  isCompleted
                    ? 'bg-orange-500 text-white'
                    : isCurrent
                      ? 'border-2 border-orange-500 text-orange-500'
                      : 'border-2 border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500'
                }`}
              >
                {isCompleted ? '\u2713' : i + 1}
              </span>
              {i < steps.length - 1 && (
                <span
                  className={`h-px w-6 ${
                    isCompleted
                      ? 'bg-orange-400'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
