import { useState } from 'react'
import { NextPage } from 'next'
import { PageSEO } from '@/components/SEO'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import siteMetadata from '@/data/siteMetadata'
import dynamic from 'next/dynamic'
import GrantReportForm from '@/components/GrantReportForm'
import PageSection from '@/components/PageSection'

const GrantValidationForm = dynamic(
  () => import('@/components/GrantValidationForm'),
  { ssr: false }
)

interface GrantDetails {
  project_name: string
  issue_number: number
  email: string
}

interface ValidationResult {
  grant_details: GrantDetails
}

const ReportSubmissionPage: NextPage = () => {
  const [grantDetails, setGrantDetails] = useState<GrantDetails | null>(null)

  const handleValidationSuccess = (result: ValidationResult) => {
    setGrantDetails(result.grant_details)
  }

  return (
    <>
      <PageSEO
        title="Submit Grantee Report"
        description="Submit your OpenSats grant progress report"
      />

      <PageSection
        title="Submit Progress Report"
        image="/static/images/avatar.png"
      >
        {!grantDetails ? (
          <>
            <p>
              To get started, please enter your grant ID and the email
              associated with your grant application. This information will be
              used to validate your grant and ensure you have access to submit a
              report.
            </p>
            <p>
              Once validated, you'll be able to submit your progress report
              detailing your work and achievements since your last update. Make
              sure to include specific details about your progress, challenges
              overcome, and plans for the next period.
            </p>
            <GrantValidationForm
              onValidationSuccess={handleValidationSuccess}
            />
          </>
        ) : (
          <GrantReportForm grantDetails={grantDetails} />
        )}
      </PageSection>
    </>
  )
}

export default ReportSubmissionPage
