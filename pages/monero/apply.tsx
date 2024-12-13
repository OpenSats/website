import { useRouter } from 'next/router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'

import { Button } from '../../components/ui/button'
import { trpc } from '../../utils/trpc'
import { useFundSlug } from '../../utils/use-fund-slug'
import { useToast } from '../../components/ui/use-toast'
import { fundSlugToRecipientEmail } from '../../utils/funds'

export default function Apply() {
  const fundSlug = useFundSlug()
  const router = useRouter()
  const { toast } = useToast()
  const applyMutation = trpc.application.submitApplication.useMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  async function onSubmit(data: Record<string, string>) {
    if (!fundSlug) return
    await applyMutation.mutateAsync({ fundSlug, formData: data })
    toast({ title: 'Success', description: 'Application successfully submitted!' })
    router.push(`/${fundSlug}/`)
  }

  if (!fundSlug) return <></>

  return (
    <div className="mx-auto flex-1 flex flex-col items-center justify-center gap-4 py-8 prose">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-5xl flex flex-col gap-4 p-4">
        <div>
          <h1>Application for Monero Fund Project Listing or General Fund Grant</h1>
          <p>Thanks for your interest in the Monero Fund!</p>
          <p>
            We&#39;re incredibly grateful to contributors like you working to support Monero,
            Bitcoin and other free and open source projects.
          </p>
          <p>
            The MAGIC Monero Fund is offering a grant program and fundraising platform to support
            Monero research and development, especially relating to privacy, security, user
            experience, and efficiency. Proposals can be related to the Monero protocol directly, or
            they can be related to other areas of the Monero ecosystem. For research projects,
            please refer to special instructions <Link href="/monero/apply_research">here</Link>.
          </p>
          <h2>Proposal Evaluation Criteria</h2>
          <div>
            Submitted proposals will be evaluated by the committee based on the following criteria:
            <ul>
              <li>
                <b>Impact:</b> The proposal should have a clear impact on the Monero Project.
              </li>
              <li>
                <b>Originality:</b> The proposal should be original and not a rehash of existing
                work.
              </li>
              <li>
                <b>Feasibility:</b> The proposal should be feasible to complete within the proposed
                time frame.
              </li>
              <li>
                <b>Quality:</b> The proposal should be well-written and well-organized.
              </li>
              <li>
                <b>Relevance:</b> The proposal should be relevant to the Monero Project.
              </li>
            </ul>
          </div>
          <h2 id="Eligibility">Eligibility</h2>
          <p>
            All developers and researchers are eligible to apply, regardless of educational attainment or
            occupation. However, as a nonprofit organization registered under U.S. tax laws, MAGIC
            Grants is required to comply with certain laws when disbursing funds to grant
            recipients. Grant recipients must complete a Due Diligence checklist, which are the last
            two pages of{' '}
            <a href="https://magicgrants.org/funds/MAGIC%20Fund%20Grant%20Disbursement%20Process%20and%20Requirements.pdf">
              this document
            </a>
            . This includes the collection of your ID and tax information. We will conduct sanctions
            checks.
          </p>
          <h2>How to Submit a Proposal</h2>
          <p>
            To submit a proposal, please complete the form below or create an issue on{' '}
            <a href="https://github.com/MAGICGrants/Monero-Fund/issues/new?assignees=&labels=&template=grant-application.md&title=[Grant+Title]">
              GitHub
            </a>
            . Applicants are free to use their legal name or a pseudonym at this step, although note
            the{' '}
            <a href="#Eligibility">
              <b>Eligibility</b>
            </a>{' '}
            section. You can choose to apply for a direct grant from the MAGIC Monero Fund&#39;s
            General Fund and/or request that your project be listed on MoneroFund.org to raise funds
            from Monero community members.
          </p>
          <p>
            Please note this form is not considered confidential and is effectively equivalent to a
            public GitHub issue. In order to reach out privately, please send an email to
            MoneroFund@magicgrants.org.
          </p>
        </div>

        <label className="checkbox">
          <input type="checkbox" {...register('general_fund')} />
          Apply to receive a grant from the MAGIC Monero Fund.
        </label>

        <label className="checkbox">
          <input type="checkbox" {...register('explore_page')} />
          Apply for project to be listed on the Monero Fund donation page.
        </label>

        <div className="w-full flex flex-col">
          <label htmlFor="project_name">Project Name *</label>
          <input
            className="appearance-none block w-full text-gray-700 border rounded py-2 px-3 mb-3 leading-tight focus:outline-none focus:ring-0"
            id="project_name"
            type="text"
            {...register('project_name', { required: true })}
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="your_name">Your Name or Pseudonym *</label>
          <input
            className="appearance-none block w-full text-gray-700 border rounded py-2 px-3 mb-3 leading-tight focus:outline-none focus:ring-0"
            id="your_name"
            type="text"
            {...register('your_name', { required: true })}
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="email">Email *</label>
          <input
            className="appearance-none block w-full text-gray-700 border rounded py-2 px-3 mb-3 leading-tight focus:outline-none focus:ring-0"
            id="email"
            type="text"
            {...register('email', { required: true })}
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="github">Project GitHub (if applicable)</label>
          <input
            className="appearance-none block w-full text-gray-700 border rounded py-2 px-3 mb-3 leading-tight focus:outline-none focus:ring-0"
            id="github"
            type="text"
            {...register('github')}
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="personal_github">Personal GitHub (if applicable)</label>
          <input
            className="appearance-none block w-full text-gray-700 border rounded py-2 px-3 mb-3 leading-tight focus:outline-none focus:ring-0"
            id="personal_github"
            type="text"
            {...register('personal_github')}
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="other_contact">Other Contact Details (if applicable)</label>
          <small>
            Please list any other relevant contact details you are comfortable sharing in case we
            need to reach out with questions. These could include GitHub username, Twitter username,
            LinkedIn, Reddit handle, other social media handles, emails, phone numbers, usernames,
            etc.
          </small>
          <textarea
            className="appearance-none block w-full text-gray-700 border rounded py-2 px-3 mb-3 leading-tight focus:outline-none focus:ring-0"
            id="other_contact"
            {...register('other_contact')}
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="short_description">Short Project Description *</label>
          <small>
            This will be listed on the explore projects page of the Monero Fund website. 2-3
            sentences.
          </small>
          <textarea
            className="appearance-none block w-full text-gray-700 border rounded py-2 px-3 mb-3 leading-tight focus:outline-none focus:ring-0"
            id="short_description"
            {...register('short_description', { required: true })}
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="long_description">Long Project Description</label>
          <small>
            This will be listed on your personal project page of the Monero Fund website. It can be
            longer and go into detail about your project.
          </small>
          <textarea
            className="appearance-none block w-full text-gray-700 border rounded py-2 px-3 mb-3 leading-tight focus:outline-none focus:ring-0"
            id="long_description"
            {...register('long_description')}
          />
        </div>

        <label className="checkbox">
          <input type="checkbox" {...register('free_open_source')} />
          Is the project free and open source?
        </label>

        <label className="checkbox">
          <input type="checkbox" {...register('are_you_lead')} />
          Are you the Project Lead / Lead Contributor
        </label>

        <div className="w-full flex flex-col">
          <label htmlFor="other_lead">
            If someone else, please list the project&#39;s Lead Contributor or Maintainer
          </label>
          <input
            className="appearance-none block w-full text-gray-700 border rounded py-2 px-3 mb-3 leading-tight focus:outline-none focus:ring-0"
            id="other_lead"
            type="text"
            {...register('other_lead')}
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="potential_impact">Potential Impact *</label>
          <small>Why is this project important to the Monero community?</small>
          <textarea
            className="appearance-none block w-full text-gray-700 border rounded py-2 px-3 mb-3 leading-tight focus:outline-none focus:ring-0"
            id="potential_impact"
            {...register('potential_impact', { required: true })}
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="timelines">Project Timelines and Potential Milestones *</label>
          <textarea
            className="appearance-none block w-full text-gray-700 border rounded py-2 px-3 mb-3 leading-tight focus:outline-none focus:ring-0"
            id="timelines"
            {...register('timelines', { required: true })}
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="proposed_budget">
            If you&#39;re applying for a grant from the general fund, please submit a proposed
            budget for the requested amount and how it will be used.
          </label>
          <input
            className="appearance-none block w-full text-gray-700 border rounded py-2 px-3 mb-3 leading-tight focus:outline-none focus:ring-0"
            id="proposed_budget"
            type="text"
            {...register('proposed_budget')}
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="bios">Applicant Bios (Optional)</label>
          <small>List relevant accomplishments.</small>
          <input
            className="appearance-none block w-full text-gray-700 border rounded py-2 px-3 mb-3 leading-tight focus:outline-none focus:ring-0"
            id="bios"
            type="text"
            {...register('bios')}
          />
        </div>

        <small>
          The MAGIC Monero Fund may require each recipient to sign a Grant Agreement before any
          funds are disbursed. This agreement will set milestones and funds will only be released
          upon completion of milestones. In order to comply with US regulations, recipients will
          need to identify themselves to MAGIC Grants, in accordance with US law.
        </small>

        <Button disabled={applyMutation.isPending}>Apply</Button>

        <p>
          After submitting your application, please allow our team up to three weeks to review your
          application. Email us at{' '}
          <a href={`mailto:${fundSlugToRecipientEmail[fundSlug]}`}>
            {fundSlugToRecipientEmail[fundSlug]}
          </a>{' '}
          if you have any questions.
        </p>
      </form>
    </div>
  )
}
