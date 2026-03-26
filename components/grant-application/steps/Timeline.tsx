import FieldError from '../FieldError'
import { StepProps } from '../types'

const inputClass =
  'mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50'

export default function Timeline({ register, errors }: StepProps) {
  return (
    <>
      <h2>Project Timeline</h2>

      <label className="block">
        Duration
        <br />
        <small>Duration of grant you are applying for</small>
        <select
          className={inputClass}
          {...register('duration', { required: true })}
        >
          <option value="12 months">12 months</option>
          <option value="9 months">9 months</option>
          <option value="6 months">6 months</option>
          <option value="3 months">3 months</option>
          <option value="Other">Other (please elaborate below)</option>
        </select>
        <FieldError errors={errors} name="duration" />
      </label>

      <label className="block">
        Time Commitment
        <br />
        <small>How much time are you going to commit to the project?</small>
        <select
          className={inputClass}
          {...register('commitment', { required: true })}
        >
          <option value="100%">100% - Full Time</option>
          <option value="75%">75% - Part Time</option>
          <option value="50%">50% - Part Time</option>
          <option value="25%">25% - Side Project</option>
        </select>
        <FieldError errors={errors} name="commitment" />
      </label>

      <label className="block">
        Project Timeline and Potential Milestones *<br />
        <small>
          This will help us evaluate overall scope and potential grant duration.
          (It&apos;s ok to pivot and/or work on something else, just let us
          know. For now we want to see that you have a rough plan and you know
          what you&apos;re doing.)
        </small>
        <textarea
          className={inputClass}
          {...register('timelines', { required: true })}
        />
        <FieldError errors={errors} name="timelines" />
      </label>
    </>
  )
}
