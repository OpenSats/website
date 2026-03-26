import FormButton from '@/components/FormButton'

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
          className="rounded-md border border-gray-300 px-5 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
        >
          Back
        </button>
      ) : (
        <div />
      )}

      {isLast ? (
        <FormButton
          variant={isFLOSS ? 'enabled' : 'disabled'}
          type="submit"
          disabled={true || loading}
        >
          Submit Grant Application
        </FormButton>
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
