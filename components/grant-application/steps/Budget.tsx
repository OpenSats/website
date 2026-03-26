import FieldError from '../FieldError'
import { StepProps } from '../types'

const inputClass =
  'mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50'

export default function Budget({ register, errors }: StepProps) {
  return (
    <>
      <h2>Project Budget</h2>

      <label className="block">
        Costs & Proposed Budget *<br />
        <small>
          Current or estimated costs of the project. If you&apos;re applying for
          a grant from the general fund, please submit a proposed budget (in
          USD) around how much funding you are requesting and how it will be
          used. Please include the grand total (in USD) to avoid any confusion.
        </small>
        <textarea
          className={inputClass}
          {...register('proposed_budget', { required: true })}
        />
        <FieldError errors={errors} name="proposed_budget" />
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
        Include details of all prior funding (dates & amounts):
        <textarea
          className={inputClass}
          {...register('what_funding')}
        />
      </label>
    </>
  )
}
