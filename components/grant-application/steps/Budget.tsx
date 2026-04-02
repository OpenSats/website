import FieldError from '../FieldError'
import { StepProps, inputClass, checkboxClass } from '../types'

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
          rows={5}
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
          className={checkboxClass}
          {...register('has_received_funding')}
        />
        <span className="ml-2">
          This project or its contributors have received prior funding
        </span>
      </label>

      {watch('has_received_funding') && (
        <label className="block">
          Include details of all prior funding (dates & amounts):
          <textarea className={inputClass} {...register('what_funding')} />
        </label>
      )}

      <hr />
      <h2>Additional Funding Sources</h2>

      <label className="inline-flex items-center">
        <input
          type="checkbox"
          className={checkboxClass}
          {...register('has_additional_funding')}
        />
        <span className="ml-2">
          I receive or plan to receive additional funding during the grant
          period
        </span>
      </label>

      {watch('has_additional_funding') && (
        <label className="block">
          Please describe the additional funding sources and amounts:
          <textarea
            className={inputClass}
            {...register('additional_funding')}
          />
        </label>
      )}
    </>
  )
}
