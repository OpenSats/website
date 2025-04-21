import { useEffect, useState } from 'react'
import { NextPage } from 'next'
import { PageSEO } from '@/components/SEO'
import { useRouter } from 'next/router'
import PageSection from '@/components/PageSection'
import GrantReportForm from '@/components/GrantReportForm'

const GRANT_STORAGE_KEY = 'opensats_grant_details'

interface GrantDetails {
  project_name: string
  issue_number: number
  email: string
}

const WritePage: NextPage = () => {
  const router = useRouter()
  const [grantDetails, setGrantDetails] = useState<GrantDetails | null>(null)

  useEffect(() => {
    const savedGrantDetails = localStorage.getItem(GRANT_STORAGE_KEY)
    if (!savedGrantDetails) {
      router.push('/reports/submit')
      return
    }
    try {
      setGrantDetails(JSON.parse(savedGrantDetails))
    } catch (e) {
      console.error('Error parsing grant details:', e)
      router.push('/reports/submit')
    }
  }, [router])

  if (!grantDetails) {
    return null // Loading state handled by useEffect redirect
  }

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

export default WritePage 