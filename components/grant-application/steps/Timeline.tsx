import CustomLink from '@/components/Link'
import FieldError from '../FieldError'
import { StepProps, inputClass } from '../types'

export default function Timeline({ register, errors }: StepProps) {
  return (
    <>
      <h2>Project Timeline</h2>

      <label className="block">
        Duration (months)
        <br />
        <small>
          How many months are you applying for? General grants must be between 3
          and 12 months. We do not accept shorter durations.{' '}
          <CustomLink href="/faq/application#what-is-the-minimum-grant-duration">
            Why?
          </CustomLink>
        </small>
        <input
          type="number"
          min={3}
          max={12}
          step={1}
          className={inputClass}
          {...register('duration', {
            required: true,
            valueAsNumber: true,
            min: {
              value: 3,
              message: 'Minimum grant duration is 3 months',
            },
            max: {
              value: 12,
              message: 'Maximum grant duration is 12 months',
            },
            validate: (value) => {
              if (typeof value !== 'number' || Number.isNaN(value)) {
                return 'This field is required'
              }
              if (!Number.isInteger(value)) {
                return 'Enter a whole number of months'
              }
              return true
            },
          })}
        />
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
          rows={5}
          className={inputClass}
          {...register('timelines', { required: true })}
        />
        <FieldError errors={errors} name="timelines" />
      </label>
    </>
  )
}
