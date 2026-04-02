import CustomLink from '@/components/Link'
import { StepProps } from '../types'

const inputClass =
  'mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50'

export default function AnythingElse({ register }: StepProps) {
  return (
    <>
      <h2>Vibe Check</h2>

      <label className="inline-flex items-start gap-2">
        <input
          type="checkbox"
          className="mt-1 rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('no_vibed_garbage', { required: true })}
        />
        <span>I promise to not produce vibed garbage.</span>
      </label>

      <label className="inline-flex items-start gap-2">
        <input
          type="checkbox"
          className="mt-1 rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('human_in_charge', { required: true })}
        />
        <span>
          I promise that a human, with good taste and good values, is in charge
          of the project.
        </span>
      </label>

      <label className="inline-flex items-start gap-2">
        <input
          type="checkbox"
          className="mt-1 rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          {...register('discipline_and_agency', { required: true })}
        />
        <span>
          I promise to bring{' '}
          <CustomLink href="https://mariozechner.at/posts/2026-03-25-thoughts-on-slowing-the-fuck-down/">
            discipline and agency
          </CustomLink>{' '}
          to the project.
        </span>
      </label>

      <small>
        The use of LLMs and coding agents is perfectly fine. These are tools,
        however, and should be used with thought and care.
      </small>

      <hr />
      <h2>Video Application</h2>

      <label className="block">
        <small>
          We strongly encourage you to record a short video (around 2 minutes)
          explaining your project and why it matters. This is optional but can
          make a real difference. Please provide a link to the video below.
        </small>
        <input
          type="text"
          placeholder="https://"
          className={inputClass}
          {...register('video_application')}
        />
      </label>

      <hr />
      <h2>Anything Else We Should Know?</h2>

      <label className="block">
        Feel free to share whatever else might be important.
        <textarea
          rows={5}
          className={inputClass}
          {...register('anything_else')}
        />
      </label>

      <div className="prose">
        <small>
          OpenSats requires each recipient to sign a Grant Agreement before any
          funds are disbursed. Using the reports and presentations required by
          the Grant Agreement, OpenSats will monitor and evaluate the
          expenditure of funds on a quarterly basis. Any apparent misuse of
          grant funds will be promptly investigated. If OpenSats discovers that
          the funds have been misused, the recipient will be required to return
          the funds immediately, and be barred from further distributions.
          OpenSats will maintain the records required by Revenue Ruling 56-304,
          1956-2 C.B. 306 regarding distribution of charitable funds to
          individuals.
        </small>
      </div>
    </>
  )
}
