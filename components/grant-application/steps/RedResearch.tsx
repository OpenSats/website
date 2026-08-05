import FieldError from '../FieldError'
import { StepProps, inputClass } from '../types'

export default function RedResearch({ register, errors }: StepProps) {
  return (
    <>
      <h2>Research</h2>

      <label className="block">
        Main Focus *
        <br />
        <small>Which area are you primarily researching?</small>
        <select
          className={inputClass}
          {...register('main_focus', { required: true })}
        >
          <option value="">(Choose One)</option>
          <option value="core">Bitcoin Core</option>
          <option value="layer1">Layer1 / Bitcoin</option>
          <option value="layer2">Layer2 / Lightning</option>
          <option value="nostr">Nostr</option>
          <option value="other">Other</option>
        </select>
        <FieldError errors={errors} name="main_focus" />
      </label>

      <label className="block">
        Short Title *<br />
        <small>
          A brief label for this research (e.g. target software or focus area).
        </small>
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
          Describe the software you are red-teaming and what you are looking
          for. Include findings so far if you have any.
        </small>
        <textarea
          rows={5}
          className={inputClass}
          {...register('short_description', { required: true })}
        />
        <FieldError errors={errors} name="short_description" />
      </label>

      <label className="block">
        Potential Impact *<br />
        <small>
          Why does this research matter for Bitcoin or related free and
          open-source software?
        </small>
        <textarea
          rows={5}
          className={inputClass}
          {...register('potential_impact', { required: true })}
        />
        <FieldError errors={errors} name="potential_impact" />
      </label>

      <label className="block">
        Disclosure Links
        <br />
        <small>
          Optional links to advisories, write-ups, coordinated disclosures, or
          related proof-of-work.
        </small>
        <textarea className={inputClass} {...register('disclosure_links')} />
      </label>
    </>
  )
}
