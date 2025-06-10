import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import GrantReportForm from '../../components/GrantReportForm'
import { STORAGE_KEYS } from '../../utils/constants'
import { PageSEO } from '../../components/SEO'
import PageSection from '../../components/PageSection'
import CustomLink from '@/components/Link'

interface GrantDetails {
  project_name: string
  issue_number: number
  email: string
}

export default function WritePage() {
  const router = useRouter()
  const [grantDetails, setGrantDetails] = useState<GrantDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedDetails = localStorage.getItem(STORAGE_KEYS.GRANT_DETAILS)
    if (!storedDetails) {
      router.replace('/reports/submit')
      return
    }
    try {
      setGrantDetails(JSON.parse(storedDetails))
    } catch (e) {
      setError('Invalid grant details')
      router.replace('/reports/submit')
    }
  }, [router])

  if (error) return <div className="text-red-500">{error}</div>
  if (!grantDetails) return <div>Loading...</div>

  return (
    <>
      <PageSEO
        title="Write Report"
        description="Write your OpenSats grant progress report"
      />

      <PageSection title="Write Report" image="/static/images/avatar.png">
        <div className="space-y-6">
          <p className="mb-6">
            Write your progress report below. You can use markdown formatting to
            structure your content. Take your time to provide detailed
            information about your progress, challenges, and future plans.
          </p>
          {/* Instructions */}
          <div className="text-base text-gray-800 dark:text-gray-200">
            <p>
              Refer to our{' '}
              <CustomLink
                href="https://opensats.org/faq/grantee"
                className="font-bold"
              >
                Grantee FAQ
              </CustomLink>{' '}
              for answers to common questions about progress report. In
              particular:
            </p>
            <ul className="mt-2">
              <li>
                <CustomLink href="/faq/grantee#what-does-an-ideal-progress-report-look-like">
                  What does an ideal progress report look like?
                </CustomLink>
              </li>
              <li>
                <CustomLink href="/faq/grantee#what-does-a-poor-progress-report-look-like">
                  What does a poor progress report look like?
                </CustomLink>
              </li>
            </ul>
          </div>

          <GrantReportForm grantDetails={grantDetails} />
        </div>
      </PageSection>
    </>
  )
}
