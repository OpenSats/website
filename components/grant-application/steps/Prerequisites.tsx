import CustomLink from '@/components/Link'
import FieldError from '../FieldError'
import { StepProps } from '../types'

export default function Prerequisites({ register, errors }: StepProps) {
  return (
    <>
      <h2>Before You Begin</h2>
      <p>
        Please review the following resources before submitting your
        application. This will help you prepare a strong submission and
        understand what we look for.
      </p>

      <label className="inline-flex items-start gap-2">
        <input
          type="checkbox"
          className="mt-1 rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('read_criteria', { required: true })}
        />
        <span>
          I have read the{' '}
          <CustomLink href="/apply#criteria">application criteria</CustomLink>{' '}
          *
        </span>
      </label>
      <FieldError
        errors={errors}
        name="read_criteria"
        message="Please read the application criteria before continuing"
      />

      <label className="inline-flex items-start gap-2">
        <input
          type="checkbox"
          className="mt-1 rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('read_faq', { required: true })}
        />
        <span>
          I have read the{' '}
          <CustomLink href="/faq/application">Application FAQ</CustomLink> *
        </span>
      </label>
      <FieldError
        errors={errors}
        name="read_faq"
        message="Please read the Application FAQ before continuing"
      />

      <label className="inline-flex items-start gap-2">
        <input
          type="checkbox"
          className="mt-1 rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('free_open_source', { required: true })}
        />
        <span>The project is free and open-source *</span>
      </label>
      <FieldError
        errors={errors}
        name="free_open_source"
        message="Your project must be free and open-source to be eligible"
      />
    </>
  )
}
