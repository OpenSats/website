import CustomLink from '@/components/Link'
import FieldError from '../FieldError'
import { StepProps } from '../types'

export default function Prerequisites({ register, watch, errors }: StepProps) {
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
          <CustomLink href="/apply#criteria">application criteria</CustomLink>
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
          <CustomLink href="/faq/application">Application FAQ</CustomLink>
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
          {...register('has_references', { required: true })}
        />
        <span>
          I have two or more{' '}
          <CustomLink href="/faq/application#what-are-you-looking-for-in-terms-of-references">
            written reference letters
          </CustomLink>{' '}
          from people familiar with my work
        </span>
      </label>
      <FieldError
        errors={errors}
        name="has_references"
        message="Please prepare your reference letters before continuing"
      />

      <label className="inline-flex items-start gap-2">
        <input
          type="checkbox"
          className="mt-1 rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('free_open_source', { required: true })}
        />
        <span>The project has a proper FOSS license</span>
      </label>
      <FieldError
        errors={errors}
        name="free_open_source"
        message="Your project must be free and open-source to be eligible"
      />
      {watch('free_open_source') && (
        <small>
          We only support projects that are free as in freedom and open to
          all. Everything produced under an OpenSats grant must be available to
          the public at all times.
          Your project must have a proper open-source license & educational
          materials must be available to the public under a{' '}
          <CustomLink href="https://www.gnu.org/licenses/license-list.html">
            free and open license
          </CustomLink>
          .
        </small>
      )}
    </>
  )
}
