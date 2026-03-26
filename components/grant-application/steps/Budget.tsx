import FieldError from '../FieldError'
import { StepProps } from '../types'

const inputClass =
  'mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50'

export default function Budget({ register, watch, errors }: StepProps) {
  return (
    <>
      <h2>Project Budget</h2>

      <label className="block">
        Costs & Proposed Budget *<br />
        <small>
          Please submit a proposed budget in USD, including a breakdown of how
          the funds will be used and the grand total.
        </small>
        <textarea
          className={inputClass}
          {...register('proposed_budget', { required: true })}
        />
        <FieldError errors={errors} name="proposed_budget" />
      </label>

      <hr />
      <h2>Prior Funding</h2>

      <label className="inline-flex items-center">
        <input
          type="checkbox"
          className="rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('has_received_funding')}
        />
        <span className="ml-2">
          This project or its contributors have received prior funding
        </span>
      </label>

      {watch('has_received_funding') && (
        <label className="block">
          Include details of all prior funding (dates & amounts):
          <textarea
            className={inputClass}
            {...register('what_funding')}
          />
        </label>
      )}
    </>
  )
}
