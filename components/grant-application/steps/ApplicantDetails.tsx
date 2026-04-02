import * as EmailValidator from 'email-validator'
import FieldError from '../FieldError'
import { StepProps, inputClass, checkboxClass } from '../types'

export default function ApplicantDetails({
  register,
  watch,
  errors,
}: StepProps) {
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

      <label className="offscreen-field block">
        Organization Website
        <input
          type="text"
          className={inputClass}
          {...register('organization_website')}
          tabIndex={-1}
          autoComplete="off"
        />
      </label>

      <label className="block">
        Other Contact Details (if applicable)
        <br />
        <small>
          Please list any other relevant contact details you are comfortable
          sharing in case we need to reach out with questions. These could
          include nostr pubkeys, social media handles, etc.
        </small>
        <textarea className={inputClass} {...register('other_contact')} />
      </label>

      <hr />

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
          If someone else, please list the project&apos;s lead contributor or
          maintainer{' '}
          <input
            type="text"
            className={inputClass}
            {...register('other_lead')}
          />
        </label>
      )}
    </>
  )
}
