import FieldError from '../FieldError'
import { StepProps, inputClass } from '../types'

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

      <label className="block">
        Has this project or its contributors received prior funding? *
        <select
          className={inputClass}
          {...register('has_received_funding', { required: true })}
        >
          <option value="">(Choose One)</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
        <FieldError errors={errors} name="has_received_funding" />
      </label>

      {watch('has_received_funding') === 'yes' && (
        <label className="block">
          Include details of all prior funding (dates & amounts): *
          <textarea className={inputClass} {...register('what_funding', { required: true })} />
          <FieldError errors={errors} name="what_funding" />
        </label>
      )}

      <hr />
      <h2>Additional Funding Sources</h2>

      <label className="block">
        Do you receive or plan to receive additional funding during the grant
        period? *
        <select
          className={inputClass}
          {...register('has_additional_funding', { required: true })}
        >
          <option value="">(Choose One)</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
        <FieldError errors={errors} name="has_additional_funding" />
      </label>

      {watch('has_additional_funding') === 'yes' && (
        <label className="block">
          Please describe the additional funding sources and amounts: *
          <textarea
            className={inputClass}
            {...register('additional_funding', { required: true })}
          />
          <FieldError errors={errors} name="additional_funding" />
        </label>
      )}
    </>
  )
}
