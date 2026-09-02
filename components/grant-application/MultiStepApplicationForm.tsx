import { ReactNode, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { DefaultValues, useForm } from 'react-hook-form'
import {
  SUBMISSION_CONTACT,
  SUBMISSION_CONTACT_AFTER_FAILURES,
  SUBMISSION_ERROR,
  submitApplication,
} from '../../utils/application-submission'
import StepIndicator from './StepIndicator'
import StepNavigation from './StepNavigation'
import TurnstileWidget, { TurnstileWidgetHandle } from './TurnstileWidget'
import { FormValues, StepProps } from './types'

export interface StepConfig {
  id: string
  title: string
  fields: readonly string[]
  render: (props: StepProps) => ReactNode
}

interface MultiStepApplicationFormProps {
  steps: readonly StepConfig[]
  hiddenFields?: Record<string, string | boolean>
  defaultValues?: DefaultValues<FormValues>
  submitLabel: string
  /** When set, submit stays disabled until every listed field is truthy. */
  submitRequiresChecked?: readonly string[]
  /** Preview builds can show the form while applications are closed. */
  allowSubmit?: boolean
}

export default function MultiStepApplicationForm({
  steps,
  hiddenFields = {},
  defaultValues,
  submitLabel,
  submitRequiresChecked,
  allowSubmit = true,
}: MultiStepApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [failureReason, setFailureReason] = useState<string>()
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [turnstileReady, setTurnstileReady] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const turnstileRef = useRef<TurnstileWidgetHandle>(null)
  const router = useRouter()

  const {
    watch,
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    // Hidden fields are seeded as default values so watch() sees them on
    // first render, before the hidden inputs register on mount.
    defaultValues: { ...hiddenFields, ...defaultValues },
  })

  const scrollToTop = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleNext = async () => {
    if (loading) return
    setFailureReason(undefined)
    const fieldsToValidate = [...steps[currentStep].fields]
    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setCurrentStep((s) => s + 1)
      scrollToTop()
    }
  }

  const handleBack = () => {
    if (loading) return
    setFailureReason(undefined)
    setCurrentStep((s) => s - 1)
    scrollToTop()
  }

  const handleStepClick = (step: number) => {
    if (loading) return
    setFailureReason(undefined)
    if (step < currentStep) {
      setCurrentStep(step)
      scrollToTop()
    }
  }

  const isLastStep = currentStep === steps.length - 1

  // Widget unmounts when leaving the last step; clear readiness so submit
  // cannot stay enabled on a stale token when the user returns.
  useEffect(() => {
    if (!isLastStep) {
      setTurnstileReady(false)
    }
  }, [isLastStep])

  const submitDisabled =
    !allowSubmit ||
    !!submitRequiresChecked?.some((name) => !watch(name)) ||
    (isLastStep && allowSubmit && !turnstileReady)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    if (
      !allowSubmit ||
      currentStep !== steps.length - 1 ||
      loading ||
      submitDisabled
    )
      return

    setLoading(true)
    setFailureReason(undefined)

    try {
      const turnstile = turnstileRef.current
      if (!turnstile) {
        throw new Error('Please complete the bot verification challenge.')
      }
      await submitApplication(data, undefined, turnstile)
      await router.push('/submitted')
    } catch (e) {
      const nextFailures = failedAttempts + 1
      setFailedAttempts(nextFailures)
      const baseMessage = e instanceof Error ? e.message : SUBMISSION_ERROR
      setFailureReason(
        nextFailures >= SUBMISSION_CONTACT_AFTER_FAILURES
          ? `${baseMessage} ${SUBMISSION_CONTACT}`
          : baseMessage
      )
      setTurnstileReady(false)
      turnstileRef.current?.reset()
    } finally {
      setLoading(false)
    }
  }

  const stepProps = { register, watch, errors }

  return (
    <form
      ref={formRef}
      onSubmit={(e) => e.preventDefault()}
      className="apply flex max-w-2xl flex-col gap-4"
    >
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" {...register(name, { value })} />
      ))}

      <hr />

      <StepIndicator
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      {steps[currentStep].render(stepProps)}

      {isLastStep && allowSubmit && (
        <div className="my-8 flex flex-col items-center py-2">
          <TurnstileWidget
            ref={turnstileRef}
            onTokenChange={(token) => setTurnstileReady(!!token)}
          />
        </div>
      )}

      {isLastStep && !allowSubmit && (
        <p className="rounded bg-yellow-100 p-4 text-yellow-900">
          This preview is for review only. Applications are closed, so
          submissions are disabled.
        </p>
      )}

      <StepNavigation
        currentStep={currentStep}
        totalSteps={steps.length}
        onBack={handleBack}
        onNext={handleNext}
        onSubmit={handleSubmit(onSubmit)}
        loading={loading}
        submitLabel={submitLabel}
        submitDisabled={submitDisabled}
      />

      {!!failureReason && (
        <p className="rounded bg-red-500 p-4 text-white">
          Something went wrong! {failureReason}
        </p>
      )}
    </form>
  )
}
