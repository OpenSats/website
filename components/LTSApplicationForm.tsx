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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      className="flex max-w-2xl flex-col gap-4"
    >
      <input
        type="hidden"
        {...register('project_name', { value: 'Long-term Grant' })}
      />
      <input
        type="hidden"
        {...register('timelines', { value: 'Ongoing work (LTS Grant).' })}
      />
      <input type="hidden" {...register('LTS', { value: true })} />

      <hr />
      <h2>Who Are You?</h2>
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
      <label className="block">
        Personal Website, GitHub profile, or other Social Media
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('personal_github')}
        />
      </label>
      <label className="block">
        Prior Contributions *<br />
        <small>
          Describe the contributions you've made to Bitcoin Core or other
          Bitcoin-related open-source projects.
        </small>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('bios', { required: true })}
        />
      </label>
      <label className="block">
        Years of Developer Experience
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('years_experience')}
        />
      </label>
      <h2>What Will You Work On?</h2>

      <label className="block">
        Project Description *<br />
        <small>
          What do you intend to work on? Please be as specific as possible.
        </small>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('short_description', { required: true })}
        />
      </label>

      <label className="block">
        Potential Impact *<br />
        <small>
          Why is your work important to Bitcoin or the broader free and
          open-source community?
        </small>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('potential_impact', { required: true })}
        />
      </label>

      <label className="block">
        Budget Expectations *<br />
        <small>
          Submit a proposed budget (in USD) around how much funding you are
          requesting and how it will be used.
        </small>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('proposed_budget', { required: true })}
        />
      </label>

      <h2>Anything Else We Should Know?</h2>

      <label className="block">
        Feel free to share whatever else might be important.
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('anything_else')}
        />
      </label>
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          className="rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('has_received_funding')}
        />
        <span className="ml-2">
          I plan to receive or am receiving funding outside of OpenSats.
        </span>
      </label>

      <label className="block">
        If you receive or plan to receive any other funding, please describe it
        here:
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('what_funding')}
        />
      </label>

      <h2>Final Questions</h2>

      <label className="block">
        Main Focus *
        <br />
        <small>In which area will your project have the most impact?</small>
        <select
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('main_focus', { required: true })}
        >
          <option value="">(Choose One)</option>
          <option value="core">Bitcoin Core</option>
          <option value="layer1">Layer1 / Bitcoin</option>
          <option value="layer2">Layer2 / Lightning</option>
          <option value="ecash">Layer3 / eCash</option>
          <option value="nostr">Nostr</option>
          <option value="other">Other</option>
        </select>
      </label>

      <label className="block">
        Any References? *<br />
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

      <label className="inline-flex items-center">
        <input
          type="checkbox"
          className="rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('free_open_source', { required: true })}
        />
        <span className="ml-2">
          Will your contributions be free and open-source? *
        </span>
      </label>
      <small>
        We focus on supporting projects that are free as in freedom and open to
        all. Your project should have a proper open-source license and any
        additional materials (such as documentation, educational materials,
        etc.) should be available to the public under a{' '}
        <CustomLink href="https://www.gnu.org/licenses/license-list.html">
          free and open license
        </CustomLink>
        .
      </small>

      <div className="prose">
        <small>
          OpenSats requires each recipient to sign a Grant Agreement before any
          funds are disbursed. Using the reports and presentations required by
          the Grant Agreement, OpenSats will monitor and evaluate the
          expenditure of funds on a quarterly basis. Any apparent misuse of
          grant funds will be promptly investigated. If OpenSats discovers that
          the funds have been misused, the recipient will be required to return
          the funds immediately, and be barred from further distributions.
          OpenSats will maintain the records required by Revenue Ruling 56-304,
          1956-2 C.B. 306 regarding distribution of charitable funds to
          individuals.
        </small>
      </div>

      <FormButton
        variant={isFLOSS ? 'enabled' : 'disabled'}
        type="submit"
        disabled={true || loading}
      >
        Submit LTS Application
      </FormButton>

      {!!failureReason && (
        <p className="rounded bg-red-500 p-4 text-white">
          Something went wrong! {failureReason}
        </p>
      )}
    </form>
  )
}
