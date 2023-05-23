import PageSection from '@/components/PageSection'
import LTSApplicationForm from '@/components/LTSApplicationForm'
import Link from '@/components/Link'

export default function Apply() {
  return (
    <PageSection title="Long-Term Support" image="/static/images/avatar.png">
      <p>
        {/* TODO: The following is shamelessly copied from Brink. We probably want to re-word it. */}
        The grant program is open to developers anywhere in the world.
      </p>
      <p>Grant applicants must:</p>
      <ul>
        <li>
          have a track record of making high-quality, security-first
          contributions to Bitcoin or related projects.
        </li>
        <li>
          be committed to transparency and accountability. Brink is a publicly
          funded organization, and grantees are expected to publicly commit to
          project deliverables and give regular public updates on progress.
        </li>
        <li>
          be self-motivated and self-driven. Grantees will provide regular
          public updates on their projects, but day-to-day will be working
          independently. To be successful, grantees must thrive in a
          no-management work environment.
        </li>
        <li>
          be able to work collaboratively and constructively with other
          open-source contributors.
        </li>
        <li>
          be committed to increasing the impact of their contributions, growing
          the developer ecosystem and scaling Bitcoin and related projects.
        </li>
      </ul>
      <p>
        If the above does not apply to you, please consider applying for a{' '}
        <Link href="/apply/grant">General Grant</Link> instead.
      </p>
      <LTSApplicationForm />
    </PageSection>
  )
}
