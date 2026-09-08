import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { STORAGE_KEYS } from '../../utils/constants'
import { getReportPreview } from '../../utils/api-helpers'
import ReportPreview from '../../components/ReportPreview'
import { PageSEO } from '../../components/SEO'
import PageSection from '../../components/PageSection'
import { fetchPostJSON } from '../../utils/api-helpers'
import { TURNSTILE_TOKEN_FIELD } from '../../utils/turnstile'
import TurnstileWidget, {
  TurnstileWidgetHandle,
} from '../../components/grant-application/TurnstileWidget'

export default function Preview() {
  const router = useRouter()
  const [reportContent, setReportContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [turnstileReady, setTurnstileReady] = useState(false)
  const turnstileRef = useRef<TurnstileWidgetHandle>(null)

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const grantDetails = localStorage.getItem(STORAGE_KEYS.GRANT_DETAILS)
        const reportData = localStorage.getItem(STORAGE_KEYS.REPORT_DRAFT)

        if (!grantDetails || !reportData) {
          router.push('/reports/submit')
          return
        }

        const parsedReportData = JSON.parse(reportData)

        const preview = getReportPreview(parsedReportData)
        setReportContent(preview)
      } catch (error) {
        console.error('Error loading preview:', error)
        router.push('/reports/submit')
      }
    }

    loadPreview()
  }, [router])

  if (!reportContent) {
    return <div>Loading preview...</div>
  }

  const handleSubmit = async () => {
    if (!reportContent || loading || !turnstileReady) return

    setLoading(true)
    setError(undefined)

    try {
      const token = await turnstileRef.current?.waitForToken()
      if (!token) {
        throw new Error('Please complete the bot verification challenge.')
      }

      const grantDetails = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.GRANT_DETAILS) || '{}'
      )
      const reportData = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.REPORT_DRAFT) || '{}'
      )
      const response = await fetchPostJSON('/api/report', {
        ...reportData,
        grant_id: grantDetails.grant_id,
        email: grantDetails.email,
        [TURNSTILE_TOKEN_FIELD]: token,
      })

      if (response.error) {
        setError(response.error)
        setTurnstileReady(false)
        turnstileRef.current?.reset()
        return
      }

      // Clear all saved data related to report submission
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key)
      })
      router.push('/reports/success')
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Failed to submit report. Please try again.'
      )
      setTurnstileReady(false)
      turnstileRef.current?.reset()
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/reports/write')
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
                Please review your report carefully before submitting. Once
                submitted, it cannot be edited.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <ReportPreview reportContent={reportContent} />
          </div>

          <div className="my-8 flex flex-col items-center py-2">
            <TurnstileWidget
              ref={turnstileRef}
              onTokenChange={(token) => setTurnstileReady(!!token)}
            />
          </div>

          {error && (
            <p className="rounded bg-red-500 p-4 text-white">{error}</p>
          )}

          <div className="mt-6 flex justify-between space-x-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
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
              disabled={loading || !turnstileReady}
              className={`rounded px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                loading || !turnstileReady
                  ? 'cursor-not-allowed bg-gray-400'
                  : 'bg-orange-500 hover:bg-orange-600'
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
