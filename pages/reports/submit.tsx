import { useState } from 'react'
import { NextPage } from 'next'
import { PageSEO } from '@/components/SEO'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import siteMetadata from '@/data/siteMetadata'
import dynamic from 'next/dynamic'
import GrantReportForm from '@/components/GrantReportForm'
import PageSection from '@/components/PageSection'
import { useRouter } from 'next/router'

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

const STORAGE_KEY = 'opensats_grant_details'

const ReportSubmissionPage: NextPage = () => {
  const router = useRouter()

  const handleValidationSuccess = (result: ValidationResult) => {
    // Store grant details in localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result.grant_details))
    // Navigate to the write page
    router.push('/reports/write')
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
        <p>
          To get started, please enter your grant ID and the email associated
          with your grant application. This information will be used to validate
          your grant and ensure you have access to submit a report.
        </p>
        <p>
          Once validated, you'll be able to submit your progress report
          detailing your work and achievements since your last update. Make sure
          to include specific details about your progress, challenges overcome,
          and plans for the next period.
        </p>
        <GrantValidationForm onValidationSuccess={handleValidationSuccess} />
      </PageSection>
    </>
  )
}

export default ReportSubmissionPage
