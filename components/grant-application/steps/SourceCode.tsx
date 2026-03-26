import CustomLink from '@/components/Link'
import FieldError from '../FieldError'
import { StepProps } from '../types'

const inputClass =
  'mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50'

export default function SourceCode({ register, errors }: StepProps) {
  return (
    <>
      <h2>Source Code</h2>

      <label className="block">
        Repository (GitHub or similar) *
        <input
          type="text"
          className={inputClass}
          {...register('github', { required: true })}
        />
        <FieldError errors={errors} name="github" />
      </label>

      <label className="block">
        Open-Source License *<br />
        <input
          type="text"
          className={inputClass}
          {...register('license', { required: true })}
        />
        <FieldError errors={errors} name="license" />
        <small>
          We only support projects that are free as in freedom and open to all.
          Your project must have a proper open-source license & educational
          materials must be available to the public under a{' '}
          <CustomLink href="https://www.gnu.org/licenses/license-list.html">
            free and open license
          </CustomLink>
          .
        </small>
      </label>

      <hr />
      <h2>Screenshots & Videos</h2>

      <label className="block">
        Project Website
        <br />
        <small>
          If you have a website or a project page, please provide the URL.
        </small>
        <input
          type="text"
          placeholder="https://"
          className={inputClass}
          {...register('website')}
        />
      </label>

      <label className="block">
        <small>
          If applicable, please provide links to screenshots, demo videos, or
          other visual materials that showcase your project.
        </small>
        <textarea className={inputClass} {...register('screenshots_videos')} />
      </label>
    </>
  )
}
