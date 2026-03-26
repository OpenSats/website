import FieldError from '../FieldError'
import { StepProps } from '../types'

const inputClass =
  'mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50'

export default function ReferencesReview({ register, errors }: StepProps) {
  return (
    <>
      <h2>References & Prior Contributions</h2>

      <label className="block">
        References *<br />
        <small>
          Please list any references from the Bitcoin community or open-source
          space that we could contact for more information on you or your
          project.
        </small>
        <textarea
          rows={5}
          className={inputClass}
          {...register('references', { required: true })}
        />
        <FieldError errors={errors} name="references" />
      </label>

      <label className="block">
        Prior Contributions
        <br />
        <small>
          Please list any prior contributions, preferably to other open-source
          or Bitcoin-related projects.
        </small>
        <textarea rows={5} className={inputClass} {...register('bios')} />
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

      <hr />
      <h2>Anything Else We Should Know?</h2>

      <label className="block">
        Feel free to share whatever else might be important.
        <textarea className={inputClass} {...register('anything_else')} />
      </label>

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
    </>
  )
}
