import { useRouter } from 'next/router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { fetchPostJSON } from '../utils/api-helpers'
import FormButton from '@/components/FormButton'
import * as EmailValidator from 'email-validator'
import CustomLink from './Link'

export default function ApplicationForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const isFLOSS = watch('free_open_source', false)
  const [failureReason, setFailureReason] = useState<string>()

  const onSubmit = async (data: any) => {
    setLoading(true)
    console.log(data)

    try {
      // Track application in GitHub
      const res = await fetchPostJSON('/api/github', data)
      if (res.message === 'success') {
        console.info('Application tracked') // Succeed silently
      } else {
        // Fail silently
      }
    } catch (e) {
      if (e instanceof Error) {
        // Fail silently
      }
    } finally {
      // Mail application to us
      try {
        const res = await fetchPostJSON('/api/sendgrid', data)
        if (res.message === 'success') {
          router.push('/submitted')
        } else {
          setFailureReason(res.message)
        }
      } catch (e) {
        if (e instanceof Error) {
          setFailureReason(e.message)
        }
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="apply flex max-w-2xl flex-col gap-4"
    >
      <input type="hidden" {...register('general_fund', { value: true })} />

      <hr />
      <h2>Project Details</h2>

      <label className="block">
        Main Focus
        <br />
        <small>In which area will your project have the most impact?</small>
        <select
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('main_focus')}
        >
          <option value="bitcoin">Bitcoin</option>
          <option value="core">Bitcoin Core</option>
          <option value="layer2">Lightning / Layer2</option>
          <option value="education">Education</option>
          <option value="nostr">nostr</option>
          <option value="other">Other</option>
        </select>
      </label>

      <label className="block">
        Project Name *<br />
        <small>The name of the project. Abbreviations are fine too.</small>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('project_name', { required: true })}
        />
      </label>

      <label className="block">
        Project Description *<br />
        <small>
          A great description will help us to evaluate your project more
          quickly.
        </small>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('short_description', { required: true })}
        />
      </label>

      <label className="block">
        Potential Impact *<br />
        <small>
          Why is this project important to Bitcoin or the broader free and
          open-source community?
        </small>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('potential_impact', { required: true })}
        />
      </label>

      <label className="block">
        Project Timelines and Potential Milestones *<br />
        <small>
          This will help us evaluate overall scope and potential grant duration.
          (It's ok to pivot and/or work on something else, just let us know. For
          now we want to see that you have a rough plan and you know what you're
          doing.)
        </small>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('timelines', { required: true })}
        />
      </label>

      <label className="block">
        Project Github (or similar, if applicable)
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('github')}
        />
      </label>

      <label className="inline-flex items-center">
        <input
          type="checkbox"
          className="rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('free_open_source')}
        />
        <span className="ml-2">Is the project free and open-source?</span>
      </label>

      <label className="block">
        Open-Source License *<br />
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('license', { required: true })}
        />
        <small>
          We focus on supporting projects that are free as in freedom and open
          to all. Your project should have a proper open-source license &
          educational materials should be available to the public under a{' '}
          <CustomLink href="https://www.gnu.org/licenses/license-list.html">
            free and open license
          </CustomLink>
          .
        </small>
      </label>
      <hr />
      <h2>Project Budget</h2>

      <label className="block">
        Costs & Proposed Budget *<br />
        <small>
          Current or estimated costs of the project. If you're applying for a
          grant from the general fund, please submit a proposed budget (in USD)
          around how much funding you are requesting and how it will be used.
        </small>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('proposed_budget', { required: true })}
        />
      </label>

      <label className="inline-flex items-center">
        <input
          type="checkbox"
          className="rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('has_received_funding')}
        />
        <span className="ml-2">
          Has this project received any prior funding?
        </span>
      </label>

      <label className="block">
        If so, please describe.
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('what_funding')}
        />
      </label>

      <hr />
      <h2>Applicant Details</h2>

      <label className="block">
        Your Name *<br />
        <small>Feel free to use your nym.</small>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          placeholder="John Doe"
          {...register('your_name', { required: true })}
        />
      </label>
      <label className="block">
        Email *
        <input
          type="email"
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          placeholder="satoshin@gmx.com"
          {...register('email', {
            required: true,
            validate: (v) =>
              EmailValidator.validate(v) ||
              'Please enter a valid email address',
          })}
        />
        <small className="text-red-500">
          {errors?.email && errors.email.message.toString()}
        </small>
      </label>
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          className="rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('are_you_lead')}
        />
        <span className="ml-2">
          Are you the Project Lead / Lead Contributor?
        </span>
      </label>
      <label className="block">
        If someone else, please list the project's Lead Contributor or
        Maintainer{' '}
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('other_lead')}
        />
      </label>
      <label className="block">
        Personal Github (or similar, if applicable)
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('personal_github')}
        />
      </label>
      <label className="block">
        Other Contact Details (if applicable)
        <br />
        <small>
          Please list any other relevant contact details you are comfortable
          sharing in case we need to reach out with questions. These could
          include nostr pubkeys, social media handles, emails, phone numbers,
          etc.
        </small>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('other_contact')}
        />
      </label>
      <hr />
      <h2>References & Prior Contributions</h2>
      <label className="block">
        References *<br />
        <small>
          Please list any references from the Bitcoin community or open-source
          space that we could contact for more information on you or your
          project.
        </small>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('references', { required: true })}
        />
      </label>
      <label className="block">
        Prior Contributions
        <br />
        <small>
          Please list any prior contributions to other open-source or
          Bitcoin-related projects.
        </small>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('bios')}
        />
      </label>
      <hr />
      <h2>Anything Else We Should Know?</h2>
      <label className="block">
        Feel free to share whatever else might be important.
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('anything_else')}
        />
      </label>
      <div className="prose">
        <small>
          Open Sats may require each recipient to sign a Grant Agreement before
          any funds are disbursed. Using the reports and presentations required
          by the Grant Agreement, Open Sats will monitor and evaluate the
          expenditure of funds on a quarterly basis. Any apparent misuse of
          grant funds will be promptly investigated. If OpenSats discovers that
          the funds have been misused, the recipient will be required to return
          the funds immediately, and be barred from further distributions. Open
          Sats will maintain the records required by Revenue Ruling 56-304,
          1956-2 C.B. 306 regarding distribution of charitable funds to
          individuals.
        </small>
      </div>

      <FormButton
        variant={isFLOSS ? 'enabled' : 'disabled'}
        type="submit"
        disabled={loading}
      >
        Submit Grant Application
      </FormButton>

      {!!failureReason && (
        <p className="rounded bg-red-500 p-4 text-white">
          Something went wrong! {failureReason}
        </p>
      )}
    </form>
  )
}
