import FieldError from '../FieldError'
import LicenseExplainer from '../LicenseExplainer'
import { StepProps, inputClass } from '../types'

export default function SourceCode({ register, errors }: StepProps) {
  return (
    <>
      <h2>Project Source Code</h2>

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
        <LicenseExplainer />
      </label>

      <hr />
      <h2>Project Media</h2>

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
