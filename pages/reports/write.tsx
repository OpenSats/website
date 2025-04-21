import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import GrantReportForm from '../../components/GrantReportForm'
import { STORAGE_KEYS } from '../../utils/constants'
import { PageSEO } from '../../components/SEO'
import PageSection from '../../components/PageSection'

export default function WritePage() {
  const router = useRouter()
  const [grantDetails, setGrantDetails] = useState<any>(null)
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
        <p className="mb-6">
          Write your progress report below. You can use markdown formatting to
          structure your content. Take your time to provide detailed information
          about your progress, challenges, and future plans.
        </p>
        <GrantReportForm grantDetails={grantDetails} />
      </PageSection>
    </>
  )
}
