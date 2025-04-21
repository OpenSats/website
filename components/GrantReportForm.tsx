import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import { STORAGE_KEYS } from '../utils/constants'

interface GrantReportFormProps {
  grantDetails: {
    project_name: string
    issue_number: number
    email: string
  }
}

interface GrantReportFormData {
  project_name: string
  time_spent: string
  next_quarter: string
  money_usage: string
  help_needed?: string
}

// Set expiration time for saved data (30 days in milliseconds)
const STORAGE_EXPIRATION = 30 * 24 * 60 * 60 * 1000

export default function GrantReportForm({
  grantDetails,
}: GrantReportFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string>()
  const [recoveredData, setRecoveredData] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    getValues,
  } = useForm<GrantReportFormData>({
    defaultValues: {
      project_name: grantDetails.project_name,
      time_spent: '',
      next_quarter: '',
      money_usage: '',
      help_needed: '',
    },
    mode: 'onBlur',
  })

  // Watch all form fields for preview
  const watchAllFields = watch()

  // Load saved form data from localStorage on initial render
  useEffect(() => {
    try {
      const storageKey = `${STORAGE_KEYS.REPORT_DRAFT}_${grantDetails.issue_number}`
      const savedData = localStorage.getItem(storageKey)

      if (savedData) {
        const parsedData = JSON.parse(savedData)

        // Check if the data has expired
        if (
          parsedData.timestamp &&
          Date.now() - parsedData.timestamp > STORAGE_EXPIRATION
        ) {
          // Data has expired, remove it
          localStorage.removeItem(storageKey)
          return
        }

        // Set form values from saved data
        if (parsedData.formData) {
          Object.keys(parsedData.formData).forEach((key) => {
            setValue(key as keyof GrantReportFormData, parsedData.formData[key])
          })
          setRecoveredData(true)
        }
      }
    } catch (e) {
      console.error('Error loading saved form data:', e)
      // If there's an error, we just continue with empty form
    }
  }, [grantDetails.issue_number, setValue])

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (isDirty) {
      try {
        const formData = getValues()
        const storageKey = `${STORAGE_KEYS.REPORT_DRAFT}_${grantDetails.issue_number}`

        // Store data with timestamp for expiration checking
        const dataToStore = {
          formData,
          timestamp: Date.now(),
        }

        localStorage.setItem(storageKey, JSON.stringify(dataToStore))
      } catch (e) {
        console.error('Error saving form data:', e)
      }
    }
  }, [watchAllFields, grantDetails.issue_number, isDirty, getValues])

  const handlePreview = handleSubmit(async (data) => {
    setError(undefined)

    // Validate required fields
    if (
      !data.project_name ||
      !data.time_spent ||
      !data.next_quarter ||
      !data.money_usage
    ) {
      setError('Please fill in all required fields before previewing')
      return
    }

    try {
      // Store grant ID and report data for preview
      localStorage.setItem(
        STORAGE_KEYS.GRANT_DETAILS,
        JSON.stringify(grantDetails)
      )
      localStorage.setItem(
        STORAGE_KEYS.REPORT_DRAFT,
        JSON.stringify({
          project_name: data.project_name,
          time_spent: data.time_spent,
          next_quarter: data.next_quarter,
          money_usage: data.money_usage,
          help_needed: data.help_needed || '',
        })
      )

      // Navigate to preview page
      await router.push('/reports/preview')
    } catch (e) {
      console.error('Error saving form data:', e)
      setError('Failed to save form data. Please try again.')
    }
  })

  if (recoveredData) {
    return (
      <div>
        <form
          onSubmit={handlePreview}
          className="apply flex max-w-2xl flex-col gap-4"
        >
          <hr />
          <h2>Report Details</h2>

          {/* Project Name */}
          <label className="block">
            Project Name *
            <br />
            <small>The name of your project as specified in your grant.</small>
            <input
              {...register('project_name', {
                required: 'Project name is required',
              })}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              disabled
            />
            {errors.project_name && (
              <small className="text-red-500">
                {errors.project_name.message}
              </small>
            )}
          </label>

          {/* Project Updates */}
          <label className="block">
            Project Updates *
            <br />
            <small>
              Describe your progress and accomplishments since the last report.
              Include links to pull requests, commits, and other work.
            </small>
            <textarea
              {...register('time_spent', {
                required: 'Project updates are required',
              })}
              rows={8}
              className="mt-1 block w-full rounded-md border-gray-300 font-mono text-sm text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            {errors.time_spent && (
              <small className="text-red-500">
                {errors.time_spent.message}
              </small>
            )}
          </label>

          {/* Plans for Next Quarter */}
          <label className="block">
            Plans for Next Quarter *
            <br />
            <small>
              Outline your goals and plans for the next quarter. Be specific
              about what you aim to accomplish.
            </small>
            <textarea
              {...register('next_quarter', {
                required: 'Plans for Next Quarter are required',
              })}
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-300 font-mono text-sm text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            {errors.next_quarter && (
              <small className="text-red-500">
                {errors.next_quarter.message}
              </small>
            )}
          </label>

          {/* Use of Funds */}
          <label className="block">
            Use of Funds *
            <br />
            <small>
              Required for legal and compliance reasons. If using for living
              expenses, simply stating 'living expenses' is sufficient. For
              project-related expenses, please provide categories (e.g., office
              expenses, travel, server costs, etc.). We strongly encourage you
              to keep records. Receipts, invoices, bank statements, etc. If
              OpenSats is ever audited, you must be able to send supporting
              information on how you used your grant proceeds.
            </small>
            <textarea
              {...register('money_usage', {
                required: 'Use of funds information is required',
              })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 font-mono text-sm text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            {errors.money_usage && (
              <small className="text-red-500">
                {errors.money_usage.message}
              </small>
            )}
          </label>

          {/* Support needed */}
          <label className="block">
            Is there anything we could help with?
            <br />
            <small>
              We're here to help! Let us know if you need any technical
              assistance, introductions, or have other questions.
            </small>
            <textarea
              {...register('help_needed')}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 font-mono text-sm text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </label>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900">
              <div className="flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Submission Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              className="rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Preview Report
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div>
      <form
        onSubmit={handlePreview}
        className="apply flex max-w-2xl flex-col gap-4"
      >
        <hr />
        <h2>Report Details</h2>

        {/* Project Name */}
        <label className="block">
          Project Name *
          <br />
          <small>The name of your project as specified in your grant.</small>
          <input
            {...register('project_name', {
              required: 'Project name is required',
            })}
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            disabled
          />
          {errors.project_name && (
            <small className="text-red-500">
              {errors.project_name.message}
            </small>
          )}
        </label>

        {/* Project Updates */}
        <label className="block">
          Project Updates *
          <br />
          <small>
            Describe your progress and accomplishments since the last report.
            Include links to pull requests, commits, and other work.
          </small>
          <textarea
            {...register('time_spent', {
              required: 'Project updates are required',
            })}
            rows={8}
            className="mt-1 block w-full rounded-md border-gray-300 font-mono text-sm text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          {errors.time_spent && (
            <small className="text-red-500">{errors.time_spent.message}</small>
          )}
        </label>

        {/* Plans for Next Quarter */}
        <label className="block">
          Plans for Next Quarter *
          <br />
          <small>
            Outline your goals and plans for the next quarter. Be specific about
            what you aim to accomplish.
          </small>
          <textarea
            {...register('next_quarter', {
              required: 'Plans for Next Quarter are required',
            })}
            rows={6}
            className="mt-1 block w-full rounded-md border-gray-300 font-mono text-sm text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          {errors.next_quarter && (
            <small className="text-red-500">
              {errors.next_quarter.message}
            </small>
          )}
        </label>

        {/* Use of Funds */}
        <label className="block">
          Use of Funds *
          <br />
          <small>
            Required for legal and compliance reasons. If using for living
            expenses, simply stating 'living expenses' is sufficient. For
            project-related expenses, please provide categories (e.g., office
            expenses, travel, server costs, etc.). We strongly encourage you to
            keep records. Receipts, invoices, bank statements, etc. If OpenSats
            is ever audited, you must be able to send supporting information on
            how you used your grant proceeds.
          </small>
          <textarea
            {...register('money_usage', {
              required: 'Use of funds information is required',
            })}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 font-mono text-sm text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          {errors.money_usage && (
            <small className="text-red-500">{errors.money_usage.message}</small>
          )}
        </label>

        {/* Support needed */}
        <label className="block">
          Is there anything we could help with?
          <br />
          <small>
            We're here to help! Let us know if you need any technical
            assistance, introductions, or have other questions.
          </small>
          <textarea
            {...register('help_needed')}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 font-mono text-sm text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </label>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900">
            <div className="flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Submission Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            className="rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Preview Report
          </button>
        </div>
      </form>
    </div>
  )
}
