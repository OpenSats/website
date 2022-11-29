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
          <h1>Application for Monero Fund Project Listing or General Fund Grant</h1>
          <p>
            Thanks for your interest in the Monero Fund!
          </p>
          <p>
            We&#39;re incredibly grateful to contributors like you working to
            support Monero, Bitcoin and other free and open source projects.
          </p>
          <p>
            The MAGIC Monero Fund is offering a grant program to support actionable Monero research, 
            especially research relating to privacy, security, user experience, and efficiency. 
            Proposals can be related to the Monero protocol directly, or they can be related to other 
            areas of the Monero ecosystem.
          </p>
          <div>
            To complete your submission, please prepare and attach a research plan for your project. 
            The plan should be 3-5 pages (not counting citations, any images, and biographical sketch) and include the following:
            <ul>
              <li>The research question you seek to answer, and how the Monero Project benefits from the research.</li>
              <li>A literature review of existing work and how your proposal improves upon it. </li>
              <li>Any preliminary work you have already completed.  </li>
              <li>Description of the plan to carry out the research. </li>
              <li>A plan to work with Monero&apos;s developers and/or researchers to integrate the results of the research into Monero&apos;s protocol or ecosystem.  </li>
              <li>A budget, likely consisting mostly of labor costs for the researcher(s). This should include the desired payment schedule, which should be no more frequent than monthly. Any additional budgetary item such as equipment should be included as well. Specify the desired form of payment, which can be cryptocurrency or fiat currency.  </li>
              <li><i>OPTIONAL:</i> A biographical sketch such as a resume or CV. Alternatively, a list of contributions to open source projects.</li>
            </ul>
          </div>
          <h2>Computing Resources Available </h2>
          <p>
            Computing and data storage resources can be made available to applicants 
            depending on research requirements, resource availability, and vetting by a third party. 
            These resources include a research computing server with a 64-thread Threadripper CPU, 256 GB RAM, 
            2TB SSD, and 12TB RAID1 HDD.
          </p>
          <h2>Proposal Evaluation Criteria</h2>
          <div>
            Submitted proposals will be evaluated by the committee based on the following criteria:  
            <ul>
              <li><b>Impact:</b> The proposal should have a clear impact on the Monero Project.</li>
              <li><b>Originality:</b> The proposal should be original and not a rehash of existing work.</li>
              <li><b>Feasibility:</b> The proposal should be feasible to complete within the proposed time frame.</li>
              <li><b>Quality:</b> The proposal should be well-written and well-organized.</li>
              <li><b>Relevance:</b> The proposal should be relevant to the Monero Project.</li>        
            </ul>
          </div>
          <h2 id="Eligibility">Eligibility</h2>
          <p>
            All qualified researchers are eligible to apply, regardless of educational attainment or occupation. 
            However, as a nonprofit organization registered under U.S. tax laws, MAGIC Grants is required to comply 
            with certain laws when disbursing funds to grant recipients.  
            Grant recipients must complete a Due Diligence checklist, 
            which are the last two pages of <a href="https://magicgrants.org/funds/MAGIC%20Fund%20Grant%20Disbursement%20Process%20and%20Requirements.pdf">this document</a>.  
            This includes the collection of your ID and tax information. We will conduct sanctions checks.  
          </p>
          <h2>Vulnerability Research</h2>
          <p>
            If your proposal seek to uncover weaknesses in the privacy and/or security features of 
            Monero as it exists today, then the Committee will require that you share any significant 
            weaknesses with the Committee (and any critical vulnerabilities with <a href="https://github.com/monero-project/meta/blob/master/VULNERABILITY_RESPONSE_PROCESS.md">Monero&apos;s official Vulnerability Response Process</a>)  90 days before publishing the research so that action can be taken to mitigate the vulnerabilities.
          </p>
          <h2>How to Submit a proposal</h2>
          <p>
            To submit a proposal, please complete the form below or create an issue on <a href="https://github.com/MAGICGrants/Monero-Fund/issues/new?assignees=&labels=&template=grant-application.md&title=[Grant+Title]">Github</a>.  
            Applicants are free to use their legal name or a pseudonym at this step, 
            although note the <a href="#Eligibility"><b>Eligibility</b></a> section. 
          </p>
          <hr />
        </div>
        <label className="checkbox">
          <input type="checkbox" {...register('general_fund')} />
          Apply to receive a grant from the Magic Monero Fund.
        </label>

        <label className="checkbox">
          <input type="checkbox" {...register('explore_page')} />
          Apply for project to be listed on the Monero Fund Donation Page.
        </label>

        <label>
          Project Name *
          <small>
            The name of the project to be listed for fundraising
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
            reddit handle, other social media handles, emails, phone
            numbers, usernames, etc.
          </small>
          <textarea {...register('other_contact')} />
        </label>
        <label>
          Short Project Description *
          <small>
            This will be listed on the explore projects page of the Monero Fund
            website. 2-3 sentences.
          </small>
          <textarea {...register('short_description', { required: true })} />
        </label>
        <label>
          Long Project Description
          <small>
            This will be listed on your personal project page of the Monero Fund
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
            Why is this project important to the Monero community?
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
            [Monero, Layer Two Protocol (eg. Lightning Network), Security
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
          submit a proposed budget for the requested amount and how it will be used.
          <input type="text" {...register('proposed_budget')} />
        </label>
        <label>
          Other Relevant Project Links
          <textarea {...register('relevant_links')} />
        </label>
        <label>
          Please include any social media or common community communication
          platforms like Twitter, Matrix, Telegram, Keybase, Discord, etc.
          <textarea {...register('social_media')} />
        </label>
        <label>
          Applicant Bios
          <small>
            Please list any contributions to Monero or
            other open source projects.
          </small>
          <textarea {...register('bios')} />
        </label>
        <label>
          References *
          <small>
            Please list any references from the Monero or open source
            community that we could contact for more info on you or your project
          </small>
          <textarea {...register('references', { required: true })} />
        </label>
        <div className="prose">
          <small>
            The MAGIC Monero Fund may require each recipient to sign a Grant Agreement
            before any funds are disbursed. This agreement will set milestones and funds
            will only be released upon completion of milestones. In order to comply with
            US regulations, recipients will need to identify themselves to MAGIC, in
            accordance with US law.
          </small>
        </div>

        <button type="submit" disabled={loading}>
          Apply
        </button>

        <p>
          After submitting your application, please allow our team up to three weeks to review your application.
          Email us at <a href="mailto:monerofund@magicgrants.org">monerofund@magicgrants.org</a> if you have any questions.
        </p>
      </form>
    </div>
  )
}
