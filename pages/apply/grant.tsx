import { GetServerSideProps } from 'next'
import PageSection from '@/components/PageSection'
import CustomLink from '@/components/Link'
import GrantApplicationForm from '@/components/GrantApplicationForm'
import { generateFormToken } from '@/utils/form-security'
import { getFormDataFromCookie } from '@/utils/form-cookies'

interface ApplyPageProps {
  formToken: {
    timestamp: number
    signature: string
  }
  savedData: Record<string, any> | null
  errorMessage: string | null
}

export const getServerSideProps: GetServerSideProps<ApplyPageProps> = async (
  context
) => {
  // Generate form token for spam protection
  const formToken = generateFormToken()

  // Check for saved form data from previous submission error
  const savedData = getFormDataFromCookie(context.req.headers.cookie)

  // Check for error message in query params
  const errorMessage =
    context.query.error === 'validation'
      ? (context.query.message as string) ||
        'Please fill in all required fields'
      : context.query.error === 'server'
      ? 'Server error. Please try again.'
      : null

  return {
    props: {
      formToken,
      savedData: savedData || null,
      errorMessage: errorMessage || null,
    },
  }
}

export default function Apply({
  formToken,
  savedData,
  errorMessage,
}: ApplyPageProps) {
  return (
    <>
      <PageSection title="Apply for a Grant" image="/static/images/avatar.png">
        <p>
          The information collected below will be used to vet your grant
          application. Please provide accurate contact information as we may
          reach out during our review and due diligence process.
        </p>
        <p>
          If your grant application is approved, we will reach out with any
          additional information necessary to ensure a fruitful partnership and
          smooth grant payouts. This may include tax related information
          depending on your location, bitcoin addresses, lightning addresses, or
          similar payment information that is required to receive donation
          payouts from OpenSats.
        </p>
        <p>
          Make sure to read the{' '}
          <CustomLink href="/apply#criteria">application criteria</CustomLink>{' '}
          and the{' '}
          <CustomLink href="/faq/application">Application FAQ</CustomLink>{' '}
          before sending in an application.
        </p>
        <GrantApplicationForm
          formToken={formToken}
          savedData={savedData}
          errorMessage={errorMessage}
        />
      </PageSection>
    </>
  )
}
