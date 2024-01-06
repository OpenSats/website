import CustomLink from './Link'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form'
import * as EmailValidator from 'email-validator'

interface Props {
  register: UseFormRegister<FieldValues>
  text?: string
  smallText?: string
  registerLabel?: string
  isRequired?: boolean
  errors?: FieldErrors<FieldValues>
}

export function ApplicantEmail(props: Props) {
  const { register, errors } = props

  return (
    <label className="block">
      Email *
      <input
        type="email"
        className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm
        focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        placeholder="satoshin@gmx.com"
        {...register('email', {
          validate: (v) =>
            EmailValidator.validate(v) || 'Please enter a valid email address',
        })}
      />
      <small className="text-red-500">
        {errors?.email && errors.email.message.toString()}
      </small>
    </label>
  )
}

export function ApplicantName(props: Props) {
  const { register } = props
  return (
    <label className="block">
      Your Name *<br />
      <small>Feel free to use your nym.</small>
      <input
        type="text"
        className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm
        focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        placeholder="John Doe"
        {...register('your_name', { required: true })}
      />
    </label>
  )
}

export function CheckboxQuestion(props: Props) {
  const { register, text, registerLabel, isRequired } = props

  let questionText = text
  if (isRequired) {
    questionText = questionText + ' *'
  }
  return (
    <label className="inline-flex items-center">
      <input
        type="checkbox"
        className="rounded-md border-gray-300 shadow-sm focus:border-orange-300
        focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        {...register(registerLabel, { required: isRequired })}
      />
      <span className="ml-2">{questionText}</span>
    </label>
  )
}

const footerText =
  'OpenSats may require each recipient to sign a Grant Agreement before any funds are disbursed. Using the reports and presentations required by the Grant Agreement, OpenSats will monitor and evaluate the expenditure of funds on a quarterly basis. Any apparent misuse of grant funds will be promptly investigated. If OpenSats discovers that funds have been misused, the recipient will be required to return the funds immediately, and be barred from further distributions. OpenSats will maintain the records required by Revenue Ruling 56-304, 1956-2 C.B. 306 regarding distribution of charitable funds to individuals.'

export function Footer() {
  return (
    <div className="prose">
      <small>{footerText}</small>
    </div>
  )
}

export function OtherContactDetails({ register }: Props) {
  return (
    <TextBoxQuestion
      register={register}
      text="Other Contact Details (if applicable)"
      smallText="Please list any other relevant contact details you are comfortable
      sharing in case we need to reach out with questions. These could
      include nostr pubkeys, social media handles, emails, phone numbers,
      etc."
      registerLabel="other_contact"
    />
  )
}

export function PotentialImpact({ register }: Props) {
  return (
    <label className="block">
      Potential Impact *<br />
      <small>
        Why is this project important to Bitcoin or the broader free and
        open-source community?
      </small>
      <textarea
        className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm
        focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        {...register('potential_impact', { required: true })}
      />
    </label>
  )
}

export function ProjectDescription(props: Props) {
  const { register, smallText } = props

  return (
    <label className="block">
      Project Description *<br />
      <small>{smallText}</small>
      <textarea
        className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm
        focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        {...register('short_description', { required: true })}
      />
    </label>
  )
}

export function ProjectFocus(props: Props) {
  const { register, text, smallText } = props

  return (
    <label className="block">
      {text}
      <br />
      <small>{smallText}</small>
      <select
        className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm
        focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        {...register('main_focus')}
      >
        <option value="bitcoin">Bitcoin</option>
        <option value="lightning">Lightning</option>
        <option value="nostr">nostr</option>
        <option value="other">Other</option>
      </select>
    </label>
  )
}

export function ProjectName(props: Props) {
  const { register, smallText } = props

  return (
    <label className="block">
      Project Name *<br />
      <small>{smallText}</small>
      <input
        type="text"
        className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm
        focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        {...register('project_name', { required: true })}
      />
    </label>
  )
}

export function Question(props: Props) {
  const { register, text, smallText, registerLabel, isRequired } = props

  let questionText = text
  if (isRequired) {
    questionText = questionText + ' *'
  }
  return (
    <label className="block">
      {questionText}
      <br />
      <small>{smallText}</small>
      <input
        type="text"
        className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm
        focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        {...register(registerLabel, { required: isRequired })}
      />
    </label>
  )
}

export function References({ register }: Props) {
  return (
    <label className="block">
      References *<br />
      <small>
        Please list any references from the Bitcoin community or open-source
        space that we could contact for more information on you or your project.
      </small>
      <textarea
        className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm
        focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        {...register('references', { required: true })}
      />
    </label>
  )
}

export function TextBoxQuestion(props: Props) {
  const { register, text, smallText, registerLabel, isRequired } = props

  let title = text
  if (isRequired) {
    title = title + ' *'
  }

  return (
    <label className="block">
      {title}
      <br />
      <small>{smallText}</small>
      <textarea
        className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm
        focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        {...register(registerLabel, { required: isRequired })}
      />
    </label>
  )
}

export function WebsiteApplicationFooter() {
  return (
    <div className="prose">
      <small>
        By submitting a listing request you agree to our{' '}
        <CustomLink href="/docs/listing-terms.pdf" className="underline">
          Terms and Conditions
        </CustomLink>
        . {footerText}
      </small>
    </div>
  )
}
