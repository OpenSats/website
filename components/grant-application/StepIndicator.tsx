interface Step {
  id: string
  title: string
}

interface StepIndicatorProps {
  steps: readonly Step[]
  currentStep: number
  onStepClick?: (step: number) => void
}

export default function StepIndicator({
  steps,
  currentStep,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className="mb-4">
      <ol className="flex items-center justify-between sm:justify-center sm:gap-3">
        {steps.map((step, i) => {
          const isCompleted = i < currentStep
          const isCurrent = i === currentStep
          return (
            <li key={step.id} className="flex items-center sm:gap-3">
              <button
                type="button"
                onClick={() => isCompleted && onStepClick?.(i)}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 sm:text-sm ${
                  isCompleted
                    ? 'cursor-pointer bg-orange-500 text-white hover:bg-orange-600'
                    : isCurrent
                      ? 'border-2 border-orange-500 text-orange-500'
                      : 'border-2 border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500'
                }`}
                disabled={!isCompleted}
              >
                {isCompleted ? '\u2713' : i}
              </button>
              {i < steps.length - 1 && (
                <span
                  className={`hidden h-px sm:block sm:w-6 ${
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
