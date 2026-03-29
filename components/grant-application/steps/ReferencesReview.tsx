import FieldError from '../FieldError'
import { StepProps } from '../types'

const inputClass =
  'mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50'

export default function ReferencesReview({ register, errors }: StepProps) {
  return (
    <>
      <h2>Written References</h2>

      <label className="block">
        References *<br />
        <small>
          Please provide at least 2 written reference statements from people in the
          Bitcoin community or open-source space who are familiar with you or
          your project.
        </small>
        <textarea
          rows={5}
          className={inputClass}
          {...register('references', { required: true })}
        />
        <FieldError errors={errors} name="references" />
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
