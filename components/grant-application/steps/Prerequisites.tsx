import CustomLink from '@/components/Link'
import FieldError from '../FieldError'
import LicenseExplainer from '../LicenseExplainer'
import { StepProps, checkboxClass } from '../types'

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
          className={`mt-1 ${checkboxClass}`}
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
          className={`mt-1 ${checkboxClass}`}
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
          className={`mt-1 ${checkboxClass}`}
          {...register('has_references', { required: true })}
        />
        <span>
          I understand that at least two{' '}
          <CustomLink href="/faq/application#what-are-you-looking-for-in-terms-of-references">
            written reference letters
          </CustomLink>{' '}
          from people familiar with my work are required
        </span>
      </label>
      <FieldError
        errors={errors}
        name="has_references"
        message="Please prepare your reference letters before continuing. Reference letters can be included as part of your application or emailed to references@opensats.org once your application is submitted. The evaluation of your application will not start until we have two references."
      />

      <label className="inline-flex items-start gap-2">
        <input
          type="checkbox"
          className={`mt-1 ${checkboxClass}`}
          {...register('free_open_source', { required: true })}
        />
        <span>The project has a proper [FOSS license](https://opensats.org/faq/grantee#what-does-it-mean-to-produce-work-under-a-free-and-open-source-license)</span>
      </label>
      <FieldError
        errors={errors}
        name="free_open_source"
        message="Your project must be free and open-source to be eligible"
      />
      {watch('free_open_source') && <LicenseExplainer />}

      <h2>Prepare Your Application</h2>
      <p>
        You can{' '}
        <a
          href="/static/opensats-grant-application-template.md"
          download="opensats-grant-application-template.md"
          className="text-orange-500"
        >
          download our application template
        </a>{' '}
        to prepare your answers offline before filling out the form.
      </p>
    </>
  )
}
