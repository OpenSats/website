import dynamic from 'next/dynamic'
import PageSection from '@/components/PageSection'
import CustomLink from '@/components/Link'
import RedBeforeYouApply from '@/components/RedBeforeYouApply'
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
          Finding exploits in Bitcoin and related free and open-source software
          takes time, skill, and often a lot of LLM tokens. This short
          application is for researchers doing that work.
        </p>
        <p>
          While there is urgency and we want to fund generously, we will be
          forced to be selective. A demonstrable trail of trust or prior work in
          Bitcoin security (or a closely related space) is expected.
        </p>
        <p>
          In light of recent events, we are fast-tracking these red team
          applications. If approved, we will follow up with any details needed
          for payouts. Prefer a full project grant instead? See{' '}
          <CustomLink href="/apply/grant">General Grant</CustomLink>.
        </p>
        <RedBeforeYouApply />
        <RedApplicationForm />
      </PageSection>
    </>
  )
}
