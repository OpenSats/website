interface StepNavigationProps {
  currentStep: number
  totalSteps: number
  onBack: () => void
  onNext: () => void
  loading: boolean
  isFLOSS: boolean
}

export default function StepNavigation({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  loading,
  isFLOSS,
}: StepNavigationProps) {
  const isLast = currentStep === totalSteps - 1

  return (
    <div className="flex justify-between pt-4">
      {currentStep > 0 ? (
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Back
        </button>
      ) : (
        <div />
      )}

      {isLast ? (
        <button
          type="submit"
          disabled={loading}
          className={`rounded-md bg-orange-500 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-600 ${
            !isFLOSS || loading ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          Submit Grant Application
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          className="rounded-md bg-orange-500 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          Continue
        </button>
      )}
    </div>
  )
}
