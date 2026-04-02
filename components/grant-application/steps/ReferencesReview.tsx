import FieldError from '../FieldError'
import { StepProps } from '../types'

const inputClass =
  'mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50'

export default function ReferencesReview({
  register,
  watch,
  errors,
}: StepProps) {
  const applicantName = watch?.('your_name') || '[Applicant Name]'
  const projectName = watch?.('project_name') || '[Project Name]'
  const suggestedSubject = `Reference for ${projectName} by ${applicantName}`

  return (
    <>
      <h2>Written References</h2>

      <label className="block">
        References *<br />
        <small>
          Please provide at least 2 written reference statements from people in
          the Bitcoin community or open-source space who are familiar with you
          or your project. Include the email address of each reference so we can
          reach out to verify.
        </small>
        <textarea
          rows={5}
          className={inputClass}
          {...register('references', { required: true })}
        />
        <FieldError errors={errors} name="references" />
        <small className="mt-1 block">
          References can also be sent directly to{' '}
          <a
            href={`mailto:references@opensats.org?subject=${encodeURIComponent(
              suggestedSubject
            )}`}
            className="text-orange-500"
          >
            references@opensats.org
          </a>{' '}
          with the following subject line:
        </small>
        <button
          type="button"
          className="mt-1 block w-full cursor-pointer rounded bg-gray-100 px-3 py-2 text-left font-mono text-sm text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          onClick={(e) => {
            navigator.clipboard.writeText(suggestedSubject)
            const btn = e.currentTarget
            const original = btn.textContent
            btn.textContent = 'Copied!'
            setTimeout(() => {
              btn.textContent = original
            }, 1500)
          }}
          title="Click to copy"
        >
          {suggestedSubject}
        </button>
      </label>

      <h2>Prior Contributions</h2>

      <label className="block">
        Prior Contributions *
        <br />
        <small>
          Please list any prior contributions, preferably to other open-source
          or Bitcoin-related projects.
        </small>
        <textarea
          rows={5}
          className={inputClass}
          {...register('bios', { required: true })}
        />
        <FieldError errors={errors} name="bios" />
      </label>

      <label className="block">
        Years of Developer Experience *
        <input
          type="text"
          className={inputClass}
          {...register('years_experience', { required: true })}
        />
        <FieldError errors={errors} name="years_experience" />
      </label>
    </>
  )
}
