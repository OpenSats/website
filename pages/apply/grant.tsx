import GrantApplicationForm from '@/components/GrantApplicationForm'
import PageSection from '@/components/PageSection'
import Link from '@/components/Link'

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
          If you want your project to be listed on the website, please apply to
          be listed <Link href="/apply/to-be-listed">here</Link>.
        </p>
        <GrantApplicationForm />
      </PageSection>
    </>
  )
}
