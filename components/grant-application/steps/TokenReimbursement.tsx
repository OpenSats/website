import FieldError from '../FieldError'
import { StepProps, inputClass } from '../types'

export default function TokenReimbursement({ register, errors }: StepProps) {
  return (
    <>
      <h2>Token Reimbursement</h2>
      <p>
        Security research often burns a lot of LLM tokens. Tell us what you have
        spent and what you need reimbursed.
      </p>

      <label className="block">
        Token Spend So Far
        <br />
        <small>
          Approximate usage to date (tokens, USD, or both). Include the tools or
          providers if helpful.
        </small>
        <textarea
          rows={4}
          className={inputClass}
          {...register('token_spend_so_far')}
        />
      </label>

      <label className="block">
        Expected Ongoing Burn *<br />
        <small>
          Rough estimate of monthly or ongoing token spend while this research
          continues.
        </small>
        <textarea
          rows={4}
          className={inputClass}
          {...register('estimated_token_burn', { required: true })}
        />
        <FieldError errors={errors} name="estimated_token_burn" />
      </label>

      <label className="block">
        Requested Reimbursement (USD) *<br />
        <small>
          How much are you asking OpenSats to reimburse? Include a short
          breakdown if useful.
        </small>
        <textarea
          rows={4}
          className={inputClass}
          {...register('proposed_budget', { required: true })}
        />
        <FieldError errors={errors} name="proposed_budget" />
      </label>
    </>
  )
}
