import { useState, useEffect } from 'react'
import { NextPage } from 'next'
import { PageSEO } from '@/components/SEO'
import { useRouter } from 'next/router'
import PageSection from '@/components/PageSection'
import ReportPreview from '@/components/ReportPreview'
import { fetchPostJSON } from '../../utils/api-helpers'

const REPORT_STORAGE_KEY = 'opensats_report_draft'
const GRANT_STORAGE_KEY = 'opensats_grant_details'

interface ReportData {
  project_name: string
  report_number: string
  time_spent: string
  next_quarter: string
  money_usage: string
  help_needed?: string
}

interface GrantDetails {
  project_name: string
  issue_number: number
  email: string
}

const PreviewPage: NextPage = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [grantDetails, setGrantDetails] = useState<GrantDetails | null>(null)

  useEffect(() => {
    // Load grant details
    const savedGrantDetails = localStorage.getItem(GRANT_STORAGE_KEY)
    if (!savedGrantDetails) {
      router.push('/reports/submit')
      return
    }

    try {
      const parsedGrantDetails = JSON.parse(savedGrantDetails)
      setGrantDetails(parsedGrantDetails)

      // Load report data using the grant's issue number
      const storageKey = `${REPORT_STORAGE_KEY}_${parsedGrantDetails.issue_number}`
      const savedData = localStorage.getItem(storageKey)
      if (!savedData) {
        router.push('/reports/write')
        return
      }

      const parsedData = JSON.parse(savedData)
      if (parsedData.formData) {
        setReportData(parsedData.formData)
      } else {
        router.push('/reports/write')
      }
    } catch (e) {
      console.error('Error loading data:', e)
      router.push('/reports/write')
    }
  }, [router])

  const handleSubmit = async () => {
    if (!reportData || !grantDetails) return

    setError(undefined)
    setLoading(true)

    try {
      const response = await fetchPostJSON('/api/report-bot', {
        ...reportData,
        issue_number: grantDetails.issue_number,
        email: grantDetails.email,
      })

      if (response.error) {
        setError(response.error)
        setLoading(false)
        return
      }

      // Clear saved data
      const storageKey = `${REPORT_STORAGE_KEY}_${grantDetails.issue_number}`
      localStorage.removeItem(storageKey)
      router.push('/reports/success')
    } catch (e) {
      setError('Failed to submit report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/reports/write')
  }

  if (!reportData || !grantDetails) {
    return null // Loading state handled by useEffect redirects
  }

  return (
    <>
      <PageSEO
        title="Preview Report"
        description="Preview your OpenSats grant progress report before submission"
      />

      <PageSection title="Preview Report" image="/static/images/avatar.png">
        <div className="space-y-6">
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
                Please review your report carefully before submitting.
                Once submitted, it cannot be edited.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <ReportPreview {...reportData} />
          </div>

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
                    Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between space-x-4">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 17l-5-5m0 0l5-5m-5 5h12"
                />
              </svg>
              Back to Edit
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`rounded px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-200 ${
                loading
                  ? 'cursor-not-allowed bg-gray-400'
                  : 'bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2'
              }`}
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </div>
      </PageSection>
    </>
  )
}

export default PreviewPage 