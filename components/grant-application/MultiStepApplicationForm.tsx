import { ReactNode, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { DefaultValues, useForm } from 'react-hook-form'
import { fetchPostJSON } from '../../utils/api-helpers'
import StepIndicator from './StepIndicator'
import StepNavigation from './StepNavigation'
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
}

export default function MultiStepApplicationForm({
  steps,
  hiddenFields = {},
  defaultValues,
  submitLabel,
}: MultiStepApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [formLoadedAt] = useState(() => Date.now())
  const [failureReason, setFailureReason] = useState<string>()
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

  const {
    watch,
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues })

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    if (currentStep !== steps.length - 1 || loading) return

    setLoading(true)
    const submissionData = { ...data, formLoadedAt }

    try {
      const res = await fetchPostJSON('/api/github', submissionData)
      if (res.message === 'success') {
        console.info('Application tracked')
      } else {
        // Fail silently
      }
    } catch (e) {
      if (e instanceof Error) {
        // Fail silently
      }
    } finally {
      try {
        const res = await fetchPostJSON('/api/sendgrid', submissionData)
        if (res.message === 'success') {
          router.push('/submitted')
        } else {
          setFailureReason(res.message)
        }
      } catch (e) {
        if (e instanceof Error) {
          setFailureReason(e.message)
        }
      } finally {
        setLoading(false)
      }
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

      <hr />

      {steps[currentStep].render(stepProps)}

      <StepNavigation
        currentStep={currentStep}
        totalSteps={steps.length}
        onBack={handleBack}
        onNext={handleNext}
        onSubmit={handleSubmit(onSubmit)}
        loading={loading}
        submitLabel={submitLabel}
      />

      {!!failureReason && (
        <p className="rounded bg-red-500 p-4 text-white">
          Something went wrong! {failureReason}
        </p>
      )}
    </form>
  )
}
