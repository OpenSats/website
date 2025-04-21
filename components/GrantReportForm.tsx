import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { fetchPostJSON } from '../utils/api-helpers'
import CustomLink from '@/components/Link'
import { useRouter } from 'next/router'
import ReportPreview from '@/components/ReportPreview'
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
  const [showPreview, setShowPreview] = useState(false)
  const [recoveredData, setRecoveredData] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    getValues,
    reset,
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

  // Clear all saved report data for this grant
  const clearSavedData = () => {
    try {
      // Find all keys in localStorage that match the pattern for this grant
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (
          key &&
          key.startsWith(`${STORAGE_KEYS.REPORT_DRAFT}_${grantDetails.issue_number}`)
        ) {
          keysToRemove.push(key)
        }
      }

      // Remove all matching keys
      keysToRemove.forEach((key) => localStorage.removeItem(key))

      return keysToRemove.length > 0
    } catch (e) {
      console.error('Error clearing saved form data:', e)
      return false
    }
  }

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

  const onSubmit = async (data: GrantReportFormData) => {
    setError(undefined)
    setLoading(true)

    try {
      const response = await fetchPostJSON('/api/report-bot', {
        ...data,
        issue_number: grantDetails.issue_number,
        email: grantDetails.email,
      })

      if (response.error) {
        setError(response.error)
        setLoading(false)
        return
      }

      // Clear saved data
      localStorage.removeItem('report_draft')
      router.push('/reports/success')
    } catch (e) {
      setError('Failed to submit report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
      localStorage.setItem(STORAGE_KEYS.GRANT_DETAILS, JSON.stringify(grantDetails))
      localStorage.setItem(STORAGE_KEYS.REPORT_DRAFT, JSON.stringify({
        project_name: data.project_name,
        time_spent: data.time_spent,
        next_quarter: data.next_quarter,
        money_usage: data.money_usage,
        help_needed: data.help_needed || ''
      }))

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
          {/* Instructions */}
          <div className="rounded-lg border-l-4 border-orange-500 bg-gradient-to-r from-orange-50 to-orange-100 p-5 shadow-sm dark:from-gray-800 dark:to-gray-700">
            <div className="flex items-center space-x-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-orange-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-base font-medium text-gray-800 dark:text-gray-200">
                Refer to our{' '}
                <CustomLink
                  href="https://opensats.org/faq/grantee"
                  className="font-bold"
                >
                  Grantee FAQ
                </CustomLink>{' '}
                or{' '}
                <a
                  href="#guidelines"
                  className="font-bold text-orange-500 hover:text-orange-600"
                >
                  guidelines below
                </a>{' '}
                for help building a quality progress report. Format your report in
                markdown.
              </p>
            </div>
          </div>

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
              <small className="text-red-500">{errors.project_name.message}</small>
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
              <small className="text-red-500">{errors.next_quarter.message}</small>
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
              expenses, travel, server costs, etc.).
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
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              We strongly encourage you to keep records. Receipts, invoices, bank
              statements, etc. If OpenSats is ever audited, you must be able to send
              supporting information on how you used your grant proceeds.
            </p>
          </label>

          {/* Support needed */}
          <label className="block">
            Is there anything we could help with?
            <br />
            <small>
              Optional. We're here to help! Let us know if you need any technical
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

          {/* Guidelines */}
          <div id="guidelines" className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              <CustomLink href="https://opensats.org/faq/grantee#what-does-an-ideal-progress-report-look-like">
                Guidelines
              </CustomLink>
            </h3>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-medium text-gray-900 dark:text-gray-100">
                    What does an ideal progress report look like?
                  </h4>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">
                    An ideal progress report is:
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700 dark:text-gray-300">
                    <li>Written in Markdown format</li>
                    <li>Between 1 and 3 pages</li>
                    <li>
                      Enriched with the most relevant links to pull requests,
                      commits, and other work produced
                    </li>
                  </ul>

                  <p className="mt-4 text-gray-700 dark:text-gray-300">
                    In the best case, each progress report:
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700 dark:text-gray-300">
                    <li>
                      Has a brief summary in each section before providing
                      additional details
                    </li>
                    <li>Tells us if you are on track</li>
                    <li>Describes challenges, and how you overcame them</li>
                    <li>
                      Includes if you are pleased or displeased with the progress
                      you made
                    </li>
                  </ul>

                  <p className="mt-4 text-gray-700 dark:text-gray-300">
                    Every progress report should show clearly the connection between
                    what was planned in the application or previous report(s) and
                    the work done since.
                  </p>

                  <p className="mt-4 text-gray-700 dark:text-gray-300">
                    We encourage you to openly discuss any obstacles that may have
                    prevented you from reaching previously established milestones,
                    and/or why your previously outlined plans changed. Remember that
                    we're here to help, not to judge.
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                  <h4 className="text-base font-medium text-gray-900 dark:text-gray-100">
                    What does a poor progress report look like?
                  </h4>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">
                    A poor progress report is:
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700 dark:text-gray-300">
                    <li>Hard to read</li>
                    <li>Hard to understand</li>
                    <li>An incredibly long wall of text</li>
                    <li>Not showing any of the actual work done</li>
                    <li>Missing links to pull requests and commits</li>
                    <li>
                      Missing context, summaries, and explanations, i.e. is only a
                      long list of links to pull requests and commits without
                      anything else
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    )
  }

  return (
    <form
      onSubmit={handlePreview}
      className="apply flex max-w-2xl flex-col gap-4"
    >
      {/* Instructions */}
      <div className="rounded-lg border-l-4 border-orange-500 bg-gradient-to-r from-orange-50 to-orange-100 p-5 shadow-sm dark:from-gray-800 dark:to-gray-700">
        <div className="flex items-center space-x-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-orange-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-base font-medium text-gray-800 dark:text-gray-200">
            Refer to our{' '}
            <CustomLink
              href="https://opensats.org/faq/grantee"
              className="font-bold"
            >
              Grantee FAQ
            </CustomLink>{' '}
            or{' '}
            <a
              href="#guidelines"
              className="font-bold text-orange-500 hover:text-orange-600"
            >
              guidelines below
            </a>{' '}
            for help building a quality progress report. Format your report in
            markdown.
          </p>
        </div>
      </div>

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
          <small className="text-red-500">{errors.project_name.message}</small>
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
          <small className="text-red-500">{errors.next_quarter.message}</small>
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
          expenses, travel, server costs, etc.).
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
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          We strongly encourage you to keep records. Receipts, invoices, bank
          statements, etc. If OpenSats is ever audited, you must be able to send
          supporting information on how you used your grant proceeds.
        </p>
      </label>

      {/* Support needed */}
      <label className="block">
        Is there anything we could help with?
        <br />
        <small>
          Optional. We're here to help! Let us know if you need any technical
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

      {/* Guidelines */}
      <div id="guidelines" className="mt-8 border-t border-gray-200 pt-6">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          <CustomLink href="https://opensats.org/faq/grantee#what-does-an-ideal-progress-report-look-like">
            Guidelines
          </CustomLink>
        </h3>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-medium text-gray-900 dark:text-gray-100">
                What does an ideal progress report look like?
              </h4>
              <p className="mt-2 text-gray-700 dark:text-gray-300">
                An ideal progress report is:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700 dark:text-gray-300">
                <li>Written in Markdown format</li>
                <li>Between 1 and 3 pages</li>
                <li>
                  Enriched with the most relevant links to pull requests,
                  commits, and other work produced
                </li>
              </ul>

              <p className="mt-4 text-gray-700 dark:text-gray-300">
                In the best case, each progress report:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700 dark:text-gray-300">
                <li>
                  Has a brief summary in each section before providing
                  additional details
                </li>
                <li>Tells us if you are on track</li>
                <li>Describes challenges, and how you overcame them</li>
                <li>
                  Includes if you are pleased or displeased with the progress
                  you made
                </li>
              </ul>

              <p className="mt-4 text-gray-700 dark:text-gray-300">
                Every progress report should show clearly the connection between
                what was planned in the application or previous report(s) and
                the work done since.
              </p>

              <p className="mt-4 text-gray-700 dark:text-gray-300">
                We encourage you to openly discuss any obstacles that may have
                prevented you from reaching previously established milestones,
                and/or why your previously outlined plans changed. Remember that
                we're here to help, not to judge.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
              <h4 className="text-base font-medium text-gray-900 dark:text-gray-100">
                What does a poor progress report look like?
              </h4>
              <p className="mt-2 text-gray-700 dark:text-gray-300">
                A poor progress report is:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700 dark:text-gray-300">
                <li>Hard to read</li>
                <li>Hard to understand</li>
                <li>An incredibly long wall of text</li>
                <li>Not showing any of the actual work done</li>
                <li>Missing links to pull requests and commits</li>
                <li>
                  Missing context, summaries, and explanations, i.e. is only a
                  long list of links to pull requests and commits without
                  anything else
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
