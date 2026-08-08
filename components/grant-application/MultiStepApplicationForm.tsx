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
}

/** Temporary: ?step=last|N on localhost and Vercel previews only. */
function allowApplyStepShortcut() {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
  )
}

function stepIndexFromQuery(
  stepParam: string | string[] | undefined,
  stepCount: number
): number | undefined {
  if (typeof stepParam !== 'string' || stepCount < 1) return undefined
  if (stepParam === 'last') return stepCount - 1
  if (/^\d+$/.test(stepParam)) {
    const index = Number(stepParam)
    if (index >= 0 && index < stepCount) return index
  }
  return undefined
}

export default function MultiStepApplicationForm({
  steps,
  hiddenFields = {},
  defaultValues,
  submitLabel,
  submitRequiresChecked,
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

  // Temporary preview/dev shortcut: /apply/red?step=last
  useEffect(() => {
    if (!router.isReady || !allowApplyStepShortcut()) return
    const index = stepIndexFromQuery(router.query.step, steps.length)
    if (index !== undefined) {
      setCurrentStep(index)
    }
  }, [router.isReady, router.query.step, steps.length])

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
    !!submitRequiresChecked?.some((name) => !watch(name)) ||
    (isLastStep && !turnstileReady)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    if (currentStep !== steps.length - 1 || loading || submitDisabled) return

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

      {isLastStep && (
        <div className="my-8 flex flex-col items-center gap-3 py-2">
          <TurnstileWidget
            ref={turnstileRef}
            onTokenChange={(token) => setTurnstileReady(!!token)}
          />
          {!turnstileReady && (
            <p className="max-w-md text-center text-sm text-gray-600 dark:text-gray-300">
              Complete the bot check above to enable submit. If nothing appears,
              allow Cloudflare challenges or confirm this domain is listed on
              the Turnstile widget.
            </p>
          )}
        </div>
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
