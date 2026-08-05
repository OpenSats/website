import CustomLink from '@/components/Link'
import CheckboxGroupError from '../CheckboxGroupError'
import LicenseExplainer from '../LicenseExplainer'
import { StepProps, checkboxClass } from '../types'

export default function Prerequisites({ register, watch, errors }: StepProps) {
  const isLts = watch('LTS')
  const isRed = watch('RED')

  const checkboxFields = isRed
    ? ([
        'red_security_research',
        'responsible_disclosure',
        'foss_outputs',
      ] as const)
    : isLts
    ? ([
        'read_criteria',
        'read_faq',
        'has_references',
        'free_open_source',
        'lts_right_fit',
      ] as const)
    : ([
        'read_criteria',
        'read_faq',
        'has_references',
        'free_open_source',
      ] as const)

  if (isRed) {
    return (
      <>
        <h2>Before You Begin</h2>
        <p>
          This track is for security researchers red-teaming Bitcoin and related
          free and open-source software. Applications are focused on supporting
          that work, including reimbursement for LLM token spend.
        </p>

        <label className="inline-flex items-start gap-2">
          <input
            type="checkbox"
            className={`mt-1 ${checkboxClass}`}
            {...register('red_security_research', { required: true })}
          />
          <span>
            I am applying for security research / red teaming support, not a
            general project grant
          </span>
        </label>

        <label className="inline-flex items-start gap-2">
          <input
            type="checkbox"
            className={`mt-1 ${checkboxClass}`}
            {...register('responsible_disclosure', { required: true })}
          />
          <span>
            I will practice responsible disclosure when reporting vulnerabilities
            to maintainers
          </span>
        </label>

        <label className="inline-flex items-start gap-2">
          <input
            type="checkbox"
            className={`mt-1 ${checkboxClass}`}
            {...register('foss_outputs', { required: true })}
          />
          <span>
            Findings, tools, and other work product from this engagement will be
            open-sourced either directly or through OpenSats
          </span>
        </label>

        <CheckboxGroupError errors={errors} names={checkboxFields} />
      </>
    )
  }

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

      <label className="inline-flex items-start gap-2">
        <input
          type="checkbox"
          className={`mt-1 ${checkboxClass}`}
          {...register('free_open_source', { required: true })}
        />
        <span>
          The project has a proper{' '}
          <CustomLink href="/faq/grantee#what-does-it-mean-to-produce-work-under-a-free-and-open-source-license">
            FOSS license
          </CustomLink>
        </span>
      </label>
      {watch('free_open_source') && <LicenseExplainer />}

      {isLts && (
        <label className="inline-flex items-start gap-2">
          <input
            type="checkbox"
            className={`mt-1 ${checkboxClass}`}
            {...register('lts_right_fit', { required: true })}
          />
          <span>
            My track record meets the LTS criteria above, and a{' '}
            <CustomLink href="/apply/grant">General Grant</CustomLink> would not
            be the right fit for me
          </span>
        </label>
      )}

      <CheckboxGroupError errors={errors} names={checkboxFields} />

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
