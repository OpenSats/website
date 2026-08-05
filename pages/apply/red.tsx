import dynamic from 'next/dynamic'
import PageSection from '@/components/PageSection'
import CustomLink from '@/components/Link'
import { PageSEO } from '@/components/SEO'

const RedApplicationForm = dynamic(
  () => import('@/components/RedApplicationForm'),
  { ssr: false }
)

export default function ApplyRed() {
  return (
    <>
      <PageSEO
        title="Apply for Red Teaming Support - OpenSats"
        description="Apply for OpenSats red teaming support, including LLM token reimbursement for security research on Bitcoin software."
      />
      <PageSection title="Red Teaming" image="/static/images/avatar.png">
        <p>
          This track is for people already finding issues in Bitcoin and related
          free and open-source software, not for building generic LLM audit
          harnesses or seeking token reimbursement alone.
        </p>
        <p>
          We will be highly selective. A demonstrable trail of trust or prior
          work in Bitcoin security (or a closely related space) is expected.
        </p>
        <p>
          In light of recent events, we are fast-tracking these red team
          applications. Tell us what you are researching and your token spend so
          far and going forward. If approved, we will follow up with any details
          needed for payouts. Prefer a full project grant instead? See{' '}
          <CustomLink href="/apply/grant">General Grant</CustomLink>.
        </p>
        <RedApplicationForm />
      </PageSection>
    </>
  )
}
