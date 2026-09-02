import { VIDEO_REQUIRED_LABEL } from '@/utils/grantRules'
import FieldError from '../FieldError'
import UsdAmountInput from '../UsdAmountInput'
import { StepProps, inputClass } from '../types'

export default function Budget({ register, watch, errors }: StepProps) {
  return (
    <>
      <h2>Project Budget</h2>

      <label className="block">
        Costs & Proposed Budget *<br />
        <small>
          Please submit a proposed budget in USD, including a breakdown of how
          the funds will be used. Enter the grand total in the field below.
        </small>
        <textarea
          rows={5}
          className={inputClass}
          {...register('proposed_budget', { required: true })}
        />
        <FieldError errors={errors} name="proposed_budget" />
      </label>

      {!watch('LTS') && (
        <>
          <label className="block">
            AI / Compute Cost *
            <br />
            <small>
              LLM tokens, APIs, and similar cost items related to working with
              coding agents. None or $0 is fine too.
            </small>
            <textarea
              rows={4}
              className={inputClass}
              {...register('ai_cost', { required: true })}
            />
            <FieldError errors={errors} name="ai_cost" />
          </label>

          <UsdAmountInput
            name="grand_total"
            label="Grand Total *"
            hint={`Total amount requested, in USD. Requests of ${VIDEO_REQUIRED_LABEL} or more require a 2:10 video.`}
            register={register}
            errors={errors}
            defaultAmount={watch('grand_total')}
          />
        </>
      )}

      <hr />
      <h2>Prior Funding</h2>

      <fieldset>
        <legend>
          Has this project or its contributors received prior funding? *
        </legend>
        <div className="mt-2 flex space-x-6">
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="yes"
              {...register('has_received_funding', { required: true })}
            />
            <span className="ml-2">Yes</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="no"
              {...register('has_received_funding', { required: true })}
            />
            <span className="ml-2">No</span>
          </label>
        </div>
        <FieldError errors={errors} name="has_received_funding" />
      </fieldset>

      {watch('has_received_funding') === 'yes' && (
        <label className="block">
          Include details of all prior funding (dates & amounts): *
          <textarea
            className={inputClass}
            {...register('what_funding', { required: true })}
          />
          <FieldError errors={errors} name="what_funding" />
        </label>
      )}

      <hr />
      <h2>Additional Funding Sources</h2>

      <fieldset>
        <legend>
          Do you receive or plan to receive additional funding during the grant
          period? *
        </legend>
        <div className="mt-2 flex space-x-6">
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="yes"
              {...register('has_additional_funding', { required: true })}
            />
            <span className="ml-2">Yes</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="no"
              {...register('has_additional_funding', { required: true })}
            />
            <span className="ml-2">No</span>
          </label>
        </div>
        <FieldError errors={errors} name="has_additional_funding" />
      </fieldset>

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
