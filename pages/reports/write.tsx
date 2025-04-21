import { NextPage } from 'next'
import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import GrantReportForm from '@/components/GrantReportForm'
import PageSection from '@/components/PageSection'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'opensats_grant_details'

const WriteReportPage: NextPage = () => {
  const router = useRouter()
  const [grantDetails, setGrantDetails] = useState(null)

  useEffect(() => {
    // Try to get grant details from URL first (for initial navigation)
    const urlGrantDetails = router.query.grantDetails
    if (urlGrantDetails) {
      const parsedDetails = JSON.parse(
        typeof urlGrantDetails === 'string' ? urlGrantDetails : '{}'
      )
      // Store in localStorage for persistence
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedDetails))
      setGrantDetails(parsedDetails)
      return
    }

    // If not in URL, try to get from localStorage (for page refreshes)
    const storedDetails = localStorage.getItem(STORAGE_KEY)
    if (storedDetails) {
      setGrantDetails(JSON.parse(storedDetails))
      return
    }

    // If no grant details found anywhere, redirect back to submit
    router.push('/reports/submit')
  }, [router, router.query.grantDetails])

  // Don't render anything while we're checking the grant details
  if (!grantDetails) {
    return null
  }

  return (
    <>
      <PageSEO
        title="Write Progress Report"
        description="Write your OpenSats grant progress report"
      />

      <PageSection
        title="Write Progress Report"
        image="/static/images/avatar.png"
      >
        <p>
          Please fill out all required fields in the form below. Make sure to
          include specific details about your progress, challenges overcome and
          plans for the next period.
        </p>
        <GrantReportForm grantDetails={grantDetails} />
      </PageSection>
    </>
  )
}

export default WriteReportPage 