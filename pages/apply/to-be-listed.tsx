import WebsiteApplicationForm from '@/components/WebsiteApplicationForm'
import PageSection from '@/components/PageSection'
import CustomLink from '@/components/Link'

export default function Apply() {
  return (
    <>
      <PageSection title="Apply to Be Listed" image="/static/images/avatar.png">
        <p>
          We list some of the most noteworthy projects in our project showcase
          on our website. Please reach out to us via{' '}
          <CustomLink href="mailto:showcase@opensats.org?subject=Listing Request">
            showcase@opensats.org
          </CustomLink>{' '}
          if you think your project should be included.
        </p>
        <p>
          Make sure to read the{' '}
          <CustomLink href="/apply#criteria">application criteria</CustomLink>{' '}
          before sending in an application.
        </p>
      </PageSection>
    </>
  )
}
