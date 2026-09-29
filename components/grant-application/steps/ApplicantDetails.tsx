import * as EmailValidator from 'email-validator'
import FieldError from '../FieldError'
import { validateNpub } from '@/utils/npub'
import { StepProps, inputClass, checkboxClass } from '../types'

interface ApplicantDetailsProps extends StepProps {
  showLeadFields?: boolean
}

export default function ApplicantDetails({
  register,
  watch,
  errors,
  showLeadFields = true,
}: ApplicantDetailsProps) {
  return (
    <>
      <h2>Applicant Details</h2>

      <label className="block">
        Your Name *<br />
        <small>Feel free to use your nym.</small>
        <input
          type="text"
          className={inputClass}
          placeholder="John Doe"
          {...register('your_name', { required: true })}
        />
        <FieldError errors={errors} name="your_name" />
      </label>

      <label className="block">
        Email *
        <input
          type="email"
          className={inputClass}
          placeholder="satoshin@gmx.com"
          {...register('email', {
            required: true,
            validate: (v: string) =>
              EmailValidator.validate(v) ||
              'Please enter a valid email address',
          })}
        />
        <FieldError errors={errors} name="email" />
      </label>

      <label className="block">
        Personal Github (or similar, if applicable)
        <input
          type="text"
          className={inputClass}
          {...register('personal_github')}
        />
      </label>

      <label className="block">
        Nostr public key (npub) (optional)
        <input
          type="text"
          className={inputClass}
          placeholder="npub1…"
          autoCapitalize="none"
          spellCheck={false}
          {...register('npub', {
            setValueAs: (value: string) => value.trim(),
            validate: validateNpub,
          })}
        />
        <FieldError errors={errors} name="npub" />
      </label>

      <label className="block">
        Other Contact Details (if applicable)
        <br />
        <small>
          Please list any other relevant contact details you are comfortable
          sharing in case we need to reach out with questions. These could
          include social media handles or other ways to reach you.
        </small>
        <textarea className={inputClass} {...register('other_contact')} />
      </label>

      <label className="block">
        Country or Countries of Work
        <br />
        <small>
          In which country or countries do you expect to carry out the funded
          work? For teams, include the countries where funded contributors will
          work. Country names are sufficient; no address is needed.
        </small>
        <input
          type="text"
          className={inputClass}
          {...register('work_countries')}
        />
      </label>

      {showLeadFields && (
        <>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className={checkboxClass}
              {...register('are_you_lead')}
            />
            <span className="ml-2">
              I am the lead developer or maintainer of this project
            </span>
          </label>

          {!watch('are_you_lead') && (
            <label className="block">
              If someone else, please list the project&apos;s lead contributor
              or maintainer{' '}
              <input
                type="text"
                className={inputClass}
                {...register('other_lead')}
              />
            </label>
          )}
        </>
      )}
    </>
  )
}
