import FieldError from '../FieldError'
import { StepProps, inputClass } from '../types'

export default function TokenReimbursement({ register, errors }: StepProps) {
  return (
    <>
      <h2>Token Reimbursement</h2>
      <p>
        Keep this focused on direct LLM token and related compute costs for the
        security research described above.
      </p>

      <label className="block">
        LLM Token Spend So Far *
        <br />
        <small>
          List the providers or tools, the approximate token usage if useful,
          and the USD amount you have already spent.
        </small>
        <textarea
          rows={4}
          className={inputClass}
          {...register('token_spend_so_far', { required: true })}
        />
        <FieldError errors={errors} name="token_spend_so_far" />
      </label>

      <label className="block">
        Expected Ongoing Token Burn *<br />
        <small>
          Estimate the monthly or remaining spend needed to continue this
          specific research.
        </small>
        <textarea
          rows={4}
          className={inputClass}
          {...register('estimated_token_burn', { required: true })}
        />
        <FieldError errors={errors} name="estimated_token_burn" />
      </label>

      <label className="block">
        Reimbursement Window *
        <br />
        <small>Expected duration of reimbursement</small>
        <select
          className={inputClass}
          {...register('duration', { required: true })}
        >
          <option value="1 month">1 month</option>
          <option value="3 months">3 months</option>
          <option value="6 months">6 months</option>
        </select>
        <FieldError errors={errors} name="duration" />
      </label>
    </>
  )
}
