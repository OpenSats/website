import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { STORAGE_KEYS } from '../../utils/constants'
import { getReportPreview } from '../../utils/api-helpers'
import ReportPreview from '../../components/ReportPreview'
import { PageSEO } from '../../components/SEO'
import PageSection from '../../components/PageSection'
import { fetchPostJSON } from '../../utils/api-helpers'

export default function Preview() {
  const router = useRouter()
  const [reportContent, setReportContent] = useState<string>('')

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
    if (!reportContent) return

    try {
      const grantDetails = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.GRANT_DETAILS) || '{}'
      )
      const reportData = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.REPORT_DRAFT) || '{}'
      )
      const response = await fetchPostJSON('/api/report', {
        ...grantDetails,
        ...reportData,
      })

      if (response.error) {
        console.error('Error submitting report:', response.error)
        return
      }

      // Clear all saved data related to report submission
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key)
      })
      router.push('/reports/success')
    } catch (e) {
      console.error('Failed to submit report. Please try again.', e)
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
              className="rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Submit Report
            </button>
          </div>
        </div>
      </PageSection>
    </>
  )
}
