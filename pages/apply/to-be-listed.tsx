import WebsiteApplicationForm from '@/components/WebsiteApplicationForm'
import PageSection from '@/components/PageSection'
import CustomLink from '@/components/Link'

export default function Apply() {
  return (
    <>
      <PageSection title="Apply to Be Listed" image="/static/images/avatar.png">
        <p>
          The information collected below will be used in order to vet your
          project. If approved, OpenSats will create a project page on our
          website where visitors can learn more about your project and donate if
          they choose to.{' '}
          <strong>Your project will be listed for one year.</strong> After one
          year, you will be prompted to re-send your application should you wish
          to be listed again.
        </p>
        <p>
          If your project is selected to be listed, we will reach out with any
          additional information necessary to ensure you are able to receive
          donation payouts. This may include tax related information depending
          on your location, bitcoin addresses, lightning addresses, or similar
          payment information that is required to receive donation payouts from
          OpenSats.
        </p>
        <p>
          Make sure to read the{' '}
          <CustomLink href="/apply#criteria">application criteria</CustomLink>{' '}
          before sending in an application.
        </p>
        <WebsiteApplicationForm />
      </PageSection>
    </>
  )
}
