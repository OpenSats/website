import WebsiteApplicationForm from "@/components/WebsiteApplicationForm"

export default function Apply() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
      <div
        className="apply flex flex-col gap-4 p-4 max-w-2xl"
      >
        <h1>Apply to Be Listed</h1>
        <p>
          Thanks for your interest in OpenSats!
        </p>
        <p>
          We're incredibly grateful to contributors like you working to
          support Bitcoin Core and other free and open-source projects.
        </p>
        <p>
          Because Open Sats is a 501(c)(3) non-profit, all projects we list on our website must be vetted by our
          board of directors to ensure that they help us further our mission
          of supporting contributors to Bitcoin and related free and open-source projects.
        </p>
        <p>
          Additionally, OpenSats must support specific PROJECTS which help to
          further our charitable mission. As such, if you are an individual
          contributor, please be sure that you list a SPECIFIC PROJECT you are
          working on.{' '}
        </p>
        <p>
          The information collected below will be used in order to vet your
          project. If approved, OpenSats will create a project page on
          our website (opensats.org/projects) where site-visitors can learn more about your project
          and donate if they choose to. Your project will be listed for one
          year. After one year, you will be prompted to re-send your
          application should you wish to be listed again.{' '}
        </p>
        <p>Criteria: </p>
        <p>
          Bitcoin: We prioritize projects that will have a direct impact on
          the utility or adoption of Bitcoin. We will consider all projects
          but prefer projects that are not readily funded and which have an
          obvious benefit to the Bitcoin community and ecosystem.
        </p>
        <p>
          Free and Open-Source: OpenSats supports free and open-source software,
          tools, and contributors which complement Bitcoin and help Bitcoin
          reach its fullest potential. Potential areas of interest include
          secure messaging, merchant acceptance tools, layer two protocols, etc.
          Source code and documents resulting from funded projects must be made
          publicly available for access, edit, and redistribution free of charge
          and without restrictions.
        </p>
        <p>
          Education and Mentorship: Funded contributors and projects should be
          prepared to share their experience and expertise with the greater
          community. We prefer developers who actively engage in mentorship,
          and help introduce Bitcoin software development to newcomers.
        </p>
        <p>
          If your project is selected to be listed, we will reach out with any
          additional information necessary to ensure you are able to receive
          donation payouts. This may include tax related information depending
          on your location and/or bitcoin addresses in order to receive
          donation payouts from OpenSats.
        </p>
        <hr />
      </div>
      <h1>Application Form</h1>
      <WebsiteApplicationForm />
    </div>
  )
}
