import { NextPage } from 'next'
import { PageSEO } from '@/components/SEO'
import CustomLink from '@/components/Link'

const ReportSuccessPage: NextPage = () => {
  return (
    <>
      <PageSEO
        title="Report Submitted Successfully"
        description="Your progress report has been submitted successfully"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl py-16">
          <div className="rounded-md bg-green-50 p-4 dark:bg-green-900">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-green-800 dark:text-green-200">
                  Report Submitted Successfully
                </h3>
                <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                  <p>Your progress report has been successfully submitted to OpenSats. A copy has been sent to your email for your records.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <CustomLink
              href="/"
              className="text-orange-500 hover:text-orange-600"
            >
              Return to Homepage
            </CustomLink>
          </div>
        </div>
      </div>
    </>
  )
}

export default ReportSuccessPage
