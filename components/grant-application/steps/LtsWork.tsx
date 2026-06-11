import FieldError from '../FieldError'
import { StepProps, inputClass } from '../types'

export default function LtsWork({ register, errors }: StepProps) {
  return (
    <>
      <h2>What Will You Work On?</h2>

      <label className="block">
        Main Focus *
        <br />
        <small>In which area will your work have the most impact?</small>
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
        Project Description *<br />
        <small>
          What do you intend to work on? Please be as specific as possible.
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
          Why is your work important to Bitcoin or the broader free and
          open-source community?
        </small>
        <textarea
          rows={5}
          className={inputClass}
          {...register('potential_impact', { required: true })}
        />
        <FieldError errors={errors} name="potential_impact" />
      </label>
    </>
  )
}
