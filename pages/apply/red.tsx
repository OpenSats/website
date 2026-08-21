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
        title="Apply for RED Token Reimbursement - OpenSats"
        description="Apply for OpenSats RED grants: reimbursement for LLM token and related compute costs used in good-faith security research on Bitcoin software."
        slug="apply-red"
      />
      <PageSection
        title="RED Token Reimbursement"
        image="/static/brand/logo-red.png"
      >
        <p>
          RED grants reimburse LLM token costs and closely related compute costs
          for researchers actively red-teaming Bitcoin and related free and
          open-source software. The application is short because the request
          should be narrow: show the research context, the spend so far, and the
          expected token burn.
        </p>
        <p>
          OpenSats reviews RED requests as expense reimbursement tied to
          concrete security work. RED grants are not salary support, maintenance
          funding, or broader project budgets. Use the{' '}
          <CustomLink href="/apply/grant">General Grant</CustomLink> path.
        </p>
        <p>
          While{' '}
          <CustomLink href="/blog/code-red-supporting-first-responders">
            there is urgency
          </CustomLink>{' '}
          and we want to fund generously, we will be forced to be selective. A
          demonstrable trail of trust or prior work in Bitcoin security (or a
          closely related space) is expected.
        </p>
        <p>
          In light of recent events, we are fast-tracking these red team
          applications. If approved, we will follow up with any details needed
          for reimbursement.
        </p>
        <hr />
        <RedBeforeYouApply />
        <RedApplicationForm />
      </PageSection>
    </>
  )
}
