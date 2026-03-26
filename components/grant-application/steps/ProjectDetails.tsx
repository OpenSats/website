import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons'
import FieldError from '../FieldError'
import { StepProps } from '../types'

const inputClass =
  'mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50'

export default function ProjectDetails({ register, watch, errors }: StepProps) {
  return (
    <>
      <h2>Project Details</h2>

      <label className="block">
        Main Focus *
        <br />
        <small>In which area will your project have the most impact?</small>
        <select className={inputClass} {...register('main_focus', { required: true })}>
          <option value="">(Choose One)</option>
          <option value="core">Bitcoin Core</option>
          <option value="education">Education</option>
          <option value="layer1">Layer1 / Bitcoin</option>
          <option value="layer2">Layer2 / Lightning</option>
          <option value="ecash">Layer3 / eCash</option>
          <option value="nostr">Nostr</option>
          <option value="other">Other</option>
        </select>
        <FieldError errors={errors} name="main_focus" />
      </label>

      {watch('main_focus') === 'education' && (
        <div
          className="not-prose mt-2 rounded-b border-t-4 border-blue-500 bg-blue-100 px-4 py-3 text-blue-900 shadow-md"
          role="alert"
        >
          <div className="flex">
            <div className="py-1">
              <FontAwesomeIcon
                icon={faGraduationCap}
                className="mr-4 h-6 w-6 text-blue-500"
              />
            </div>
            <div>
              <p className="mb-2 font-bold">Application Requirements</p>
              <ul className="list-disc pl-6 text-sm">
                <li>
                  Educational material MUST be published under an{' '}
                  <strong>
                    <a
                      className="text-orange-600 underline hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                      href="https://www.gnu.org/philosophy/free-doc.html"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      open license
                    </a>
                  </strong>
                  {' '}&#185;
                </li>
                <li>
                  Educational material MUST be publicly available to anyone (for
                  free)&#178;
                </li>
                <li>
                  You MUST provide at least <strong>two references</strong> that
                  we can reach out to
                </li>
                <li>
                  In addition to the above,{' '}
                  <strong>developer-focused education</strong> initiatives are
                  what we want to support most.
                </li>
              </ul>
              <p className="mb-2 mt-4 font-bold">Reporting Requirements</p>
              <ul className="list-disc pl-6 text-sm">
                <li>
                  <strong>Monthly</strong> progress reports MUST be submitted on
                  time
                </li>
                <li>
                  Progress reports MUST contain proof-of-work that is easily
                  verifiable by us
                </li>
              </ul>
              <hr className="mb-3 mt-6 border-blue-200" />
              <p className="mb-0 mt-2 text-xs">
                {' '}
                (&#185;) For example:{' '}
                <a
                  className="text-orange-600 underline hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                  href="https://creativecommons.org/licenses/by/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CC BY
                </a>
                ,{' '}
                <a
                  className="text-orange-600 underline hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                  href="https://creativecommons.org/licenses/by-sa/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CC BY-SA
                </a>
                ,{' '}
                <a
                  className="text-orange-600 underline hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                  href="https://creativecommons.org/publicdomain/zero/1.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CC0
                </a>
                ,{' '}
                <a
                  className="text-orange-600 underline hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                  href="https://www.gnu.org/licenses/fdl-1.3.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GNU FDL
                </a>
              </p>
              <p className="mb-0 mt-1 text-xs">
                {' '}
                (&#178;) No paywalls, no signups, no invite-only systems
              </p>
            </div>
          </div>
        </div>
      )}

      <label className="block">
        Project Name *<br />
        <small>The name of the project. Abbreviations are fine too.</small>
        <input
          type="text"
          className={inputClass}
          {...register('project_name', { required: true })}
        />
        <FieldError errors={errors} name="project_name" />
      </label>

      <label className="block">
        Project Description *<br />
        <small>
          A great description will help us to evaluate your project more
          quickly.
        </small>
        <textarea
          className={inputClass}
          {...register('short_description', { required: true })}
        />
        <FieldError errors={errors} name="short_description" />
      </label>

      <label className="block">
        Potential Impact *<br />
        <small>
          Why is this project important to Bitcoin or the broader free and
          open-source community?
        </small>
        <textarea
          className={inputClass}
          {...register('potential_impact', { required: true })}
        />
        <FieldError errors={errors} name="potential_impact" />
      </label>

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
    </>
  )
}
