import { useRouter } from 'next/router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { fetchPostJSON } from '../utils/api-helpers'
import * as EmailValidator from 'email-validator'

export default function GranteeReportForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const [failureReason, setFailureReason] = useState<string>()

  interface FormData {
    grant_id: string
    email: string
    period: string
    progress: string
    challenges: string
    next_steps: string
    comments: string
    type: string
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    console.log(data)

    try {
      // Track report submission in GitHub
      const res = await fetchPostJSON('/api/github', {
        ...data,
        type: 'grantee-report',
      })
      if (res.message === 'success') {
        console.info('Report tracked')
      }
    } catch (e) {
      // Fail silently
    } finally {
      // Mail report to OpenSats
      try {
        const res = await fetchPostJSON('/api/sendgrid', {
          ...data,
          type: 'grantee-report',
        })
        if (res.message === 'success') {
          router.push('/submitted')
        } else {
          setFailureReason(res.message)
        }
      } catch (e) {
        if (e instanceof Error) {
          setFailureReason(e.message)
        }
      }
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      {/* Grant ID */}
      <div>
        <label
          htmlFor="grant_id"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Grant ID
        </label>
        <input
          {...register('grant_id', { required: true })}
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800"
          placeholder="OSG-2023-XXX"
        />
        {errors.grant_id && (
          <span className="text-sm text-red-600">Grant ID is required</span>
        )}
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Email
        </label>
        <input
          {...register('email', {
            required: true,
            validate: (value) => EmailValidator.validate(value),
          })}
          type="email"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800"
        />
        {errors.email && (
          <span className="text-sm text-red-600">Valid email is required</span>
        )}
      </div>

      {/* Reporting Period */}
      <div>
        <label
          htmlFor="period"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Reporting Period
        </label>
        <select
          {...register('period', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="">Select period...</option>
          <option value="Q1">Q1 Report</option>
          <option value="Q2">Q2 Report</option>
          <option value="Q3">Q3 Report</option>
          <option value="Q4">Q4 Report</option>
          <option value="Final">Final Report</option>
        </select>
        {errors.period && (
          <span className="text-sm text-red-600">
            Please select a reporting period
          </span>
        )}
      </div>

      {/* Project Progress */}
      <div>
        <label
          htmlFor="progress"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Project Progress
        </label>
        <textarea
          {...register('progress', { required: true })}
          rows={6}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800"
          placeholder="Describe the progress made during this period, including completed milestones and any deviations from the original plan."
        />
        {errors.progress && (
          <span className="text-sm text-red-600">
            Progress description is required
          </span>
        )}
      </div>

      {/* Challenges */}
      <div>
        <label
          htmlFor="challenges"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Challenges and Solutions
        </label>
        <textarea
          {...register('challenges')}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800"
          placeholder="Describe any challenges encountered and how they were (or will be) addressed."
        />
      </div>

      {/* Next Steps */}
      <div>
        <label
          htmlFor="next_steps"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Next Steps
        </label>
        <textarea
          {...register('next_steps', { required: true })}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800"
          placeholder="Outline the planned activities and milestones for the next period."
        />
        {errors.next_steps && (
          <span className="text-sm text-red-600">Next steps are required</span>
        )}
      </div>

      {/* Additional Comments */}
      <div>
        <label
          htmlFor="comments"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Additional Comments
        </label>
        <textarea
          {...register('comments')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800"
          placeholder="Any additional information you'd like to share."
        />
      </div>

      {failureReason && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error submitting report
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{failureReason}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:bg-orange-600 dark:hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </div>
    </form>
  )
}
