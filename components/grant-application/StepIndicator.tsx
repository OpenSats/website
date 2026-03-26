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
      <ol className="flex items-center justify-between gap-1 sm:gap-2">
        {steps.map((step, i) => {
          const isCompleted = i < currentStep
          const isCurrent = i === currentStep
          return (
            <li key={step.id} className="flex flex-1 items-center gap-1 sm:gap-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 sm:text-sm ${
                    isCompleted
                      ? 'bg-orange-500 text-white'
                      : isCurrent
                        ? 'border-2 border-orange-500 text-orange-500'
                        : 'border-2 border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500'
                  }`}
                >
                  {isCompleted ? '\u2713' : i + 1}
                </span>
                <span
                  className={`hidden text-xs sm:inline sm:text-sm ${
                    isCurrent
                      ? 'font-semibold'
                      : isCompleted
                        ? 'text-gray-600 dark:text-gray-400'
                        : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <span
                  className={`mx-1 hidden h-px flex-1 sm:block ${
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
