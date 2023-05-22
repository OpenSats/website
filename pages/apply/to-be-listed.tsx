import WebsiteApplicationForm from "@/components/WebsiteApplicationForm"
import PageSection from "@/components/PageSection"

export default function Apply() {
  return (
    <>
    <PageSection title='Apply to Be Listed' image='/static/image/avatar.png'>
        <p>
          The information collected below will be used in order to vet your
          project. If approved, OpenSats will create a project page on our
          website where visitors can learn more about your project and donate if
          they choose to. <strong>Your project will be listed for one
          year.</strong> After one year, you will be prompted to re-send your
          application should you wish to be listed again.
        </p>
        <p>
          If your project is selected to be listed, we will reach out with any
          additional information necessary to ensure you are able to receive
          donation payouts. This may include tax related information depending
          on your location and/or bitcoin addresses in order to receive
          donation payouts from OpenSats.
        </p>
    </PageSection>
    <WebsiteApplicationForm />
    </>
  )
}
