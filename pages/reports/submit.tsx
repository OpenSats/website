import { useState } from 'react'
import { NextPage } from 'next'
import { PageSEO } from '@/components/SEO'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import siteMetadata from '@/data/siteMetadata'
import GrantValidationForm from '@/components/GrantValidationForm'
import GrantReportForm from '@/components/GrantReportForm'

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

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pb-8 pt-6 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Submit Progress Report
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            {!grantDetails
              ? 'To get started, please enter your grant ID and the email associated with your grant application.'
              : 'Please fill out all required fields in the form below.'}
          </p>
        </div>

        <div className="container py-12">
          <div className="lg:col-span-2 lg:mx-auto lg:w-full lg:max-w-2xl">
            {!grantDetails ? (
              <GrantValidationForm
                onValidationSuccess={handleValidationSuccess}
              />
            ) : (
              <GrantReportForm grantDetails={grantDetails} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ReportSubmissionPage
