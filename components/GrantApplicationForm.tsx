import { useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { fetchPostJSON } from '../utils/api-helpers'
import StepIndicator from './grant-application/StepIndicator'
import StepNavigation from './grant-application/StepNavigation'
import Prerequisites from './grant-application/steps/Prerequisites'
import ApplicantDetails from './grant-application/steps/ApplicantDetails'
import ProjectDetails from './grant-application/steps/ProjectDetails'
import SourceCode from './grant-application/steps/SourceCode'
import Timeline from './grant-application/steps/Timeline'
import Budget from './grant-application/steps/Budget'
import ReferencesReview from './grant-application/steps/ReferencesReview'
import { FormValues } from './grant-application/types'

const STEPS = [
  {
    id: 'prerequisites',
    title: 'Prerequisites',
    fields: ['read_criteria', 'read_faq', 'has_references', 'free_open_source'],
  },
  {
    id: 'applicant',
    title: 'Applicant',
    fields: ['your_name', 'email'],
  },
  {
    id: 'project',
    title: 'Project',
    fields: [
      'main_focus',
      'project_name',
      'short_description',
      'potential_impact',
    ],
  },
  {
    id: 'source',
    title: 'Source Code',
    fields: ['github', 'license'],
  },
  {
    id: 'timeline',
    title: 'Timeline',
    fields: ['duration', 'timelines', 'commitment'],
  },
  {
    id: 'budget',
    title: 'Budget',
    fields: ['proposed_budget'],
  },
  {
    id: 'references',
    title: 'References',
    fields: ['references', 'years_experience'],
  },
] as const

export default function ApplicationForm() {
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
  } = useForm<FormValues>({
    defaultValues: {
      duration: '6 months',
    },
  })

  const isFLOSS = watch('free_open_source', false)

  const scrollToTop = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleNext = async () => {
    const fieldsToValidate = [...STEPS[currentStep].fields]
    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setCurrentStep((s) => s + 1)
      scrollToTop()
    }
  }

  const handleBack = () => {
    setCurrentStep((s) => s - 1)
    scrollToTop()
  }

  const handleStepClick = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step)
      scrollToTop()
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
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
      onSubmit={handleSubmit(onSubmit)}
      className="apply flex max-w-2xl flex-col gap-4"
    >
      <input type="hidden" {...register('general_fund', { value: true })} />

      <StepIndicator steps={STEPS} currentStep={currentStep} onStepClick={handleStepClick} />

      <hr />

      {currentStep === 0 && <Prerequisites {...stepProps} />}
      {currentStep === 1 && <ApplicantDetails {...stepProps} />}
      {currentStep === 2 && <ProjectDetails {...stepProps} />}
      {currentStep === 3 && <SourceCode {...stepProps} />}
      {currentStep === 4 && <Timeline {...stepProps} />}
      {currentStep === 5 && <Budget {...stepProps} />}
      {currentStep === 6 && <ReferencesReview {...stepProps} />}

      <StepNavigation
        currentStep={currentStep}
        totalSteps={STEPS.length}
        onBack={handleBack}
        onNext={handleNext}
        loading={loading}
        isFLOSS={!!isFLOSS}
      />

      {!!failureReason && (
        <p className="rounded bg-red-500 p-4 text-white">
          Something went wrong! {failureReason}
        </p>
      )}
    </form>
  )
}
