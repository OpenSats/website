import dynamic from 'next/dynamic'
import PageSection from '@/components/PageSection'
import CustomLink from '@/components/Link'
import ClosedNotice from '@/components/ClosedNotice'

const GrantApplicationForm = dynamic(
  () => import('@/components/GrantApplicationForm'),
  { ssr: false }
)

export default function Apply() {
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
          before sending in an application.
        </p>
        <ClosedNotice />
        <GrantApplicationForm />
      </PageSection>
    </>
  )
}
