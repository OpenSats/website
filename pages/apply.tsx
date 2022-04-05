import { useRouter } from 'next/router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { fetchPostJSON } from '../utils/api-helpers'
export default function Apply() {
  async function handleClick() { }
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data: any) => {
    setLoading(true)
    console.log(data)
    const res = await fetchPostJSON('/api/sendgrid', data)
    if (res.message === 'success') {
      router.push('/submitted')
    }
    console.log(res)
    setLoading(false)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="apply flex flex-col gap-4 p-4 max-w-2xl"
      >
        {/* {errors.exampleRequired && <span>This field is required</span>} */}
        <div className="prose">
          <h1>Application for Project Listing on OpenSats.org</h1>
          <p>
            Thanks for your interest in listing your project with Open Sats!
          </p>
          <p>
            We&#39;re incredibly grateful to contributors like you working to
            support Bitcoin Core and other free and open source projects.
          </p>
          <p>
            Because Open Sats is a non-profit charitable organization and
            intends to qualify for 501(c)(3) status (application currently
            pending), all projects we list on our website must be vetted by our
            board of directors to ensure that they help us further our mission
            of supporting contributors to free and open source projects, like
            Bitcoin.
          </p>
          <p>
            None of our officers or directors make any money for helping to
            manage OpenSats and 100% of charitable donations through our
            platform will be passed onto contributors to free and open source
            projects. Open Sats will accept bitcoin and fiat donations (credit
            and debit cards, wires, etc.), however payment processing fees are
            generously covered by a few organizational sponsors. All donations
            will be converted to, held, and distributed to grant and donation
            recipients in bitcoin... although, exceptions may be considered to
            distribute funds in fiat.{' '}
          </p>
          <p>
            Additionally, Open Sats must support specific PROJECTS which help to
            further our charitable mission. As such, if you are an individual
            contributor, please be sure that you list a SPECIFIC PROJECT you are
            working on.{' '}
          </p>
          <p>
            The information collected below will be used in order to vet your
            project. If accepted and your project fits within the criteria of
            what we are able to support, Open Sats will create a project page on
            our website where site-visitors can learn more about your project
            and donate if they choose to. Your project will be listed for one
            year. After one year, you will be prompted to re-send your
            application should you wish to be listed again.{' '}
          </p>
          <p>
            When our site goes live, there will also be the opportunity to apply
            for grants.
          </p>
          <p>Criteria: </p>
          <p>
            Bitcoin: We prioritize projects that will have a direct impact on
            the utility or adoption of Bitcoin. We will consider all projects
            but prefer projects that are not readily funded and which have an
            obvious benefit to the Bitcoin community and ecosystem. Potential
            projects include Bitcoin Core contributions, scientific/security
            research, code review, design/UX improvements, etc.
          </p>
          <p>
            Free and Open Source Software: We support free and open-source
            software and tools that complement the use of Bitcoin. Potential
            areas of interest include secure messaging, merchant acceptance
            tools, layer two protocols, etc. Source code and documents resulting
            from funded projects must be made publicly available for access,
            edit, and redistribution free of charge and without restrictions.
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
            donation payouts from Open Sats.
          </p>
          <p>Best,</p>
          <p>The Open Sats Team</p>
          <hr />
        </div>
        <label className="checkbox">
          <input type="checkbox" {...register('general_fund')} />
          Apply to receive a grant from the OpenSats General Fund
        </label>

        <label className="checkbox">
          <input type="checkbox" {...register('explore_page')} />
          Apply for my project to be listed on the OpenSats Explore Page
        </label>

        <label>
          Project Name *
          <small>
            The name of the project to be listed on the open sats website
          </small>
          <input
            type="text"
            {...register('project_name', { required: true })}
          />
        </label>

        <label>
          Your Name *
          <input type="text" {...register('your_name', { required: true })} />
        </label>
        <label>
          Email *
          <input type="text" {...register('email', { required: true })} />
        </label>
        <label>
          Project Github (if applicable)
          <input type="text" {...register('github')} />
        </label>
        <label>
          Personal Github (if applicable)
          <input type="text" {...register('personal_github')} />
        </label>
        <label>
          Other Contact Details (if applicable)
          <small>
            Please list any other relevant contact details you are comfortable
            sharing in case we need to reach out with questions.
          </small>
          <small>
            These could include github username, twitter username, LinkedIn,
            bitcoinhackers username, other social media handles, emails, phone
            numbers, usernames, etc.
          </small>
          <textarea {...register('other_contact')} />
        </label>
        <label>
          Short Project Description *
          <small>
            This will be listed on the project explore page of the Open Sats
            website. 2-3 sentences, no more than 200 characters.
          </small>
          <textarea {...register('short_description', { required: true })} />
        </label>
        <label>
          Long Project Description
          <small>
            This will be listed on your personal project page of the Open Sats
            website. It can be longer and go into detail about your project.
          </small>
          <textarea {...register('long_description')} />
        </label>
        {/* <label>
                    Project Images: (attachment)
                    <input type="text" {...register('your_name', { required: true })} />
                </label> */}
        <label className="checkbox">
          <input type="checkbox" {...register('free_open_source')} />
          Is the project free and open source?
        </label>
        <label className="checkbox">
          <input type="checkbox" {...register('are_you_lead')} />
          Are you the Project Lead / Lead Contributor
        </label>
        <label>
          If someone else, please list the project&#39;s Lead Contributor or
          Maintainer <input type="text" {...register('other_lead')} />
        </label>
        <label>
          Potential Impact *
          <small>
            Why is this project important to Bitcoin or the broader free and
            open source community?
          </small>
          <textarea {...register('potential_impact', { required: true })} />
        </label>
        <label>
          Project Timelines and Potential Milestones *
          <textarea {...register('timelines', { required: true })} />
        </label>
        <label>
          Project Keywords *
          <small>
            These keywords will be used to help website visitors filter to your
            project.
          </small>
          <small>
            [Bitcoin Core, Layer Two Protocol (eg. Lightning Network), Security
            or Protocol Research, Code Review, Design / User Experience, Other
            Free and Open Source Project (eg. Tor), Other]
          </small>
          <input type="text" {...register('keywords', { required: true })} />
        </label>

        <label className="checkbox">
          <input type="checkbox" {...register('has_received_funding')} />
          Has this project received any funding?
        </label>

        <label>
          If so, please describe.
          <input type="text" {...register('what_funding')} />
        </label>
        <label>
          If you&#39;re applying for a grant from the general fund, please
          submit a proposed budget around how much funding you are requesting
          and how it will be used
          <input type="text" {...register('proposed_budget')} />
        </label>
        <label>
          Other Relevant Project Links
          <textarea {...register('relevant_links')} />
        </label>
        <label>
          Please include any social media or common community communication
          platforms like Twitter, Telegram, Keybase, Discord, etc.
          <textarea {...register('social_media')} />
        </label>
        <label>
          Applicant Bios
          <small>
            Please list any contributions to other open source or
            Bitcoin-related projects.
          </small>
          <textarea {...register('bios')} />
        </label>
        <label>
          References *
          <small>
            Please list any references from the Bitcoin community or open source
            space that we could contact for more info on you or your project
          </small>
          <textarea {...register('references', { required: true })} />
        </label>
        <div className="prose">
          <small>
            Open Sats may require each recipient to sign a Grant Agreement
            before any funds are disbursed. Using the reports and presentations
            required by the Grant Agreement, Open Sats will monitor and evaluate
            the expenditure of funds on a quarterly basis. Any apparent misuse
            of grant funds will be promptly investigated. If OpenSats discovers
            that the funds have been misused, the recipient will be required to
            return the funds immediately, and be barred from further
            distributions. Open Sats will maintain the records required by
            Revenue Ruling 56-304, 1956-2 C.B. 306 regarding distribution of
            charitable funds to individuals.
          </small>
        </div>

        <button type="submit" disabled={loading}>
          Apply
        </button>

        <p>
          After submitting your application, please send images of your project
          to <a href="mailto:support@opensats.org">support@opensats.org</a> for
          inclusion on your project page.
        </p>
      </form>
    </div>
  )
}
