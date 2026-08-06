import FieldError from '../FieldError'
import { StepProps, inputClass } from '../types'

export default function RedResearch({ register, errors }: StepProps) {
  return (
    <>
      <h2>Research</h2>

      <label className="block">
        Short Title *<br />
        <small>(e.g. target software or focus area)</small>
        <input
          type="text"
          className={inputClass}
          {...register('project_name', { required: true })}
        />
        <FieldError errors={errors} name="project_name" />
      </label>

      <label className="block">
        What Are You Researching? *<br />
        <small>
          Describe the software you are red-teaming and the general scope of
          what you propose to do. Do not include exploit code, reproduction
          steps, or other nonpublic technical findings.
        </small>
        <textarea
          rows={5}
          className={inputClass}
          {...register('short_description', { required: true })}
        />
        <FieldError errors={errors} name="short_description" />
      </label>

      <label className="block">
        Prior Work *<br />
        <small>
          Links or references that show a trail of trust or prior work in
          Bitcoin security or a closely related space, plus any disclosures or
          write-ups for this engagement (patches, public research, advisories,
          etc.).
        </small>
        <textarea
          rows={5}
          className={inputClass}
          {...register('prior_work', { required: true })}
        />
        <FieldError errors={errors} name="prior_work" />
      </label>
    </>
  )
}
