import FieldError from '../FieldError'
import { StepProps, inputClass } from '../types'

export default function TokenReimbursement({ register, errors }: StepProps) {
  return (
    <>
      <h2>Budget</h2>
      <p>
        Security research burns a lot of LLM tokens these days. Tell us what you
        have spent and what you need reimbursed.
      </p>

      <label className="block">
        Token Spend So Far *
        <br />
        <small>
          Prefer USD; include approximate token spend too if you can. Mention
          tools or providers if helpful.
        </small>
        <textarea
          rows={4}
          className={inputClass}
          {...register('token_spend_so_far', { required: true })}
        />
        <FieldError errors={errors} name="token_spend_so_far" />
      </label>

      <label className="block">
        Expected Ongoing Burn *<br />
        <small>
          Rough estimate of monthly or ongoing spend while this research
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
        Duration *
        <br />
        <small>How long do you need support for?</small>
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
