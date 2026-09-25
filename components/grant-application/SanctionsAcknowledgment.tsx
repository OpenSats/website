import FieldError from './FieldError'
import { StepProps, checkboxClass } from './types'

export default function SanctionsAcknowledgment({
  register,
  errors,
  name = 'ack_sanctions',
}: Pick<StepProps, 'register' | 'errors'> & { name?: string }) {
  return (
    <>
      <label className="inline-flex items-start gap-2">
        <input
          type="checkbox"
          className={`mt-1 ${checkboxClass}`}
          {...register(name, { required: true })}
        />
        <span>
          I represent that neither my participation in this program nor any
          payment to me is prohibited under applicable sanctions or
          export-control law, and that I will provide compliance information
          reasonably requested before payment.
        </span>
      </label>
      <FieldError errors={errors} name={name} />
    </>
  )
}
