import PageSection from '@/components/PageSection'
import LTSApplicationForm from '@/components/LTSApplicationForm'
import Link from '@/components/Link'
import CustomLink from '@/components/Link'
import ClosedNotice from '@/components/ClosedNotice'

export default function Apply() {
  return (
    <PageSection title="Long-Term Support" image="/static/images/avatar.png">
      <p>
        The OpenSats LTS Grant program is not bound to meatspace. Developers may
        apply independent of geographical location.
      </p>
      <p>
        In addition to our general{' '}
        <CustomLink href="/apply#criteria">application criteria</CustomLink>,
        LTS Grant applicants must:
      </p>
      <ul>
        <li>
          have a track record of making high-quality and high-impact open-source
          contributions to Bitcoin or related projects.
        </li>
        <li>
          be comfortable with{' '}
          <CustomLink href="https://bitcoin-resources.com/books/working-in-public">
            working in public
          </CustomLink>
          , as well as committed to transparency and accountability. OpenSats is
          501(c)(3) public charity, and grantees are expected to commit to
          providing regular updates on progress towards OpenSats and the public
          at large.
        </li>
        <li>
          be self-motivated, self-driven, and able to work independently.
          Grantees must thrive in an open-source development environment, which
          is a little- to no-management environment.
        </li>
        <li>
          be able to work collaboratively and constructively with potential
          users and other open-source contributors.
        </li>
      </ul>
      <p>
        If the above does not apply to you, please consider applying for a{' '}
        <Link href="/apply/grant">General Grant</Link> instead.
      </p>
      <ClosedNotice />
      <LTSApplicationForm />
    </PageSection>
  )
}
