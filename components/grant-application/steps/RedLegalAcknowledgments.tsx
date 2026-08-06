import CustomLink from '@/components/Link'
import CheckboxGroupError from '../CheckboxGroupError'
import { RED_ACK_FIELDS } from '../redTerms'
import { StepProps, checkboxClass } from '../types'

export default function RedLegalAcknowledgments({
  register,
  errors,
}: StepProps) {
  return (
    <>
      <hr />
      <h2>Acknowledgments</h2>
      <p>All of the following are required before you can submit.</p>

      <label className="inline-flex items-start gap-2">
        <input
          type="checkbox"
          className={`mt-1 ${checkboxClass}`}
          {...register('red_ack_not_authorization', { required: true })}
        />
        <span>
          I understand that OpenSats funding is not authorization to access or
          test any system, device, network, account, funds, or data, and that I
          am responsible for obtaining any permission my work requires and for
          ensuring that it is lawful.
        </span>
      </label>

      <label className="inline-flex items-start gap-2">
        <input
          type="checkbox"
          className={`mt-1 ${checkboxClass}`}
          {...register('red_ack_sanctions', { required: true })}
        />
        <span>
          I represent that neither my participation in this program nor any
          payment to me is prohibited under applicable sanctions or
          export-control law, and that I will provide compliance information
          reasonably requested before payment.
        </span>
      </label>

      <label className="inline-flex items-start gap-2">
        <input
          type="checkbox"
          className={`mt-1 ${checkboxClass}`}
          {...register('red_ack_llm_accounts', { required: true })}
        />
        <span>
          Any LLM, compute, hosting, or similar services that OpenSats funds or
          reimburses will be obtained through accounts I am authorized to use
          and in compliance with the provider&apos;s terms.
        </span>
      </label>

      <label className="inline-flex items-start gap-2">
        <input
          type="checkbox"
          className={`mt-1 ${checkboxClass}`}
          {...register('red_ack_accurate_responsible', { required: true })}
        />
        <span>
          The information in this application is accurate to the best of my
          knowledge. I will report vulnerabilities responsibly as described
          above, and will not exploit, threaten to exploit, or improperly sell
          or transfer nonpublic findings.
        </span>
      </label>

      <label className="inline-flex items-start gap-2">
        <input
          type="checkbox"
          className={`mt-1 ${checkboxClass}`}
          {...register('red_ack_terms', { required: true })}
        />
        <span>
          I have read and agree to the requirements above and to the OpenSats{' '}
          <CustomLink href="/terms">Terms of Use</CustomLink> and{' '}
          <CustomLink href="/privacy">Privacy Policy</CustomLink>.
        </span>
      </label>

      <CheckboxGroupError errors={errors} names={RED_ACK_FIELDS} />
    </>
  )
}
