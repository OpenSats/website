import dynamic from 'next/dynamic'
import PageSection from '@/components/PageSection'
import { PageSEO } from '@/components/SEO'

const GrantApplicationForm = dynamic(
  () => import('@/components/GrantApplicationForm'),
  { ssr: false }
)

export default function Apply() {
  return (
    <>
      <PageSEO
        title="Apply for a Grant - OpenSats"
        description="Apply for an OpenSats grant. Global, nym-friendly, and flexible."
      />
      <PageSection title="Apply for a Grant" image="/static/images/avatar.png">
        <p>
          The information collected below will be used to evaluate your grant
          application. Please provide accurate contact information as we may
          reach out during our review and due diligence process.
        </p>
        <p>
          If your grant application is approved, we will reach out with any
          additional information necessary to ensure a fruitful partnership and
          smooth grant payouts. This may include tax related information
          depending on your location, bitcoin addresses, lightning addresses, or
          similar payment information that is required to receive grant payouts
          from OpenSats.
        </p>
        <GrantApplicationForm />
      </PageSection>
    </>
  )
}
