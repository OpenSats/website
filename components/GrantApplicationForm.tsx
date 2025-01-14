import { useState, FormEvent } from 'react'
import { useRouter } from 'next/router'
import CustomLink from './Link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons'

interface GrantApplicationFormProps {
  formToken: {
    timestamp: number
    signature: string
  }
  savedData: Record<string, any> | null
  errorMessage: string | null
}

export default function GrantApplicationForm({
  formToken,
  savedData,
  errorMessage,
}: GrantApplicationFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [failureReason, setFailureReason] = useState<string | null>(
    errorMessage
  )
  const [mainFocus, setMainFocus] = useState(savedData?.main_focus || '')
  const [isFLOSS, setIsFLOSS] = useState(savedData?.free_open_source || false)

  // Progressive enhancement: handle form submission with JS
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    // Check if JS should enhance the form
    const form = e.currentTarget
    const formData = new FormData(form)

    // Add JS indicator
    formData.append('_jsEnabled', 'true')

    e.preventDefault()
    setLoading(true)
    setFailureReason(null)

    try {
      const response = await fetch('/api/apply-grant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      })

      const data = await response.json()

      if (response.ok && data.message === 'success') {
        router.push('/submitted')
      } else {
        setFailureReason(
          data.error || 'Something went wrong. Please try again.'
        )
        setLoading(false)
      }
    } catch (error) {
      setFailureReason(
        'Network error. Please check your connection and try again.'
      )
      setLoading(false)
    }
  }

  return (
    <form
      action="/api/apply-grant"
      method="POST"
      onSubmit={handleSubmit}
      className="apply flex max-w-2xl flex-col gap-4"
    >
      {/* Hidden fields for spam protection */}
      <input type="hidden" name="general_fund" value="true" />
      <input type="hidden" name="formTimestamp" value={formToken.timestamp} />
      <input type="hidden" name="formSignature" value={formToken.signature} />

      {/* Error message display */}
      {failureReason && (
        <div
          className="rounded border-l-4 border-red-500 bg-red-100 p-4 text-red-900"
          role="alert"
        >
          <p className="font-bold">Error</p>
          <p>{failureReason}</p>
        </div>
      )}

      <hr />
      <h2>Project Details</h2>

      <label className="block">
        Main Focus *
        <br />
        <small>In which area will your project have the most impact?</small>
        <select
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          name="main_focus"
          required
          defaultValue={savedData?.main_focus || mainFocus}
          onChange={(e) => setMainFocus(e.target.value)}
        >
          <option value="">(Choose One)</option>
          <option value="core">Bitcoin Core</option>
          <option value="education">Education</option>
          <option value="layer1">Layer1 / Bitcoin</option>
          <option value="layer2">Layer2 / Lightning</option>
          <option value="ecash">Layer3 / eCash</option>
          <option value="nostr">Nostr</option>
          <option value="other">Other</option>
        </select>
      </label>

      {mainFocus === 'education' && (
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
                  ¹
                </li>
                <li>
                  Educational material MUST be publicly available to anyone (for
                  free)²
                </li>
                <li>
                  You MUST provide at least <strong>two references</strong> that
                  we can reach out to
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
                (¹) For example:{' '}
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
                (²) No paywalls, no signups, no invite-only systems
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
          name="project_name"
          required
          defaultValue={savedData?.project_name}
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        />
      </label>

      <label className="block">
        Project Description *<br />
        <small>
          A great description will help us to evaluate your project more
          quickly.
        </small>
        <textarea
          name="short_description"
          required
          defaultValue={savedData?.short_description}
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        />
      </label>

      <label className="block">
        Potential Impact *<br />
        <small>
          Why is this project important to Bitcoin or the broader free and
          open-source community?
        </small>
        <textarea
          name="potential_impact"
          required
          defaultValue={savedData?.potential_impact}
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        />
      </label>

      <label className="block">
        Project Website
        <br />
        <small>
          If you have a website or a project page, please provide the URL.
        </small>
        <input
          type="text"
          name="website"
          placeholder="https://"
          defaultValue={savedData?.website}
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        />
      </label>

      <hr />
      <h2>Source Code</h2>

      <label className="block">
        Repository (GitHub or similar, if applicable)
        <input
          type="text"
          name="github"
          defaultValue={savedData?.github}
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        />
      </label>

      <label className="inline-flex items-center">
        <input
          type="checkbox"
          name="free_open_source"
          value="true"
          required
          defaultChecked={savedData?.free_open_source || false}
          onChange={(e) => setIsFLOSS(e.target.checked)}
          className="rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        />
        <span className="ml-2">Is the project free and open-source? *</span>
      </label>

      <label className="block">
        Open-Source License *<br />
        <input
          type="text"
          name="license"
          required
          defaultValue={savedData?.license}
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        />
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
      <h2>Project Timeline</h2>

      <label className="block">
        Duration
        <br />
        <small>Duration of grant you are applying for</small>
        <select
          name="duration"
          required
          defaultValue={savedData?.duration || '6 months'}
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        >
          <option value="12 months">12 months</option>
          <option value="9 months">9 months</option>
          <option value="6 months">6 months</option>
          <option value="3 months">3 months</option>
          <option value="Other">Other (please elaborate below)</option>
        </select>
      </label>

      <label className="block">
        Project Timeline and Potential Milestones *<br />
        <small>
          This will help us evaluate overall scope and potential grant duration.
          (It's ok to pivot and/or work on something else, just let us know. For
          now we want to see that you have a rough plan and you know what you're
          doing.)
        </small>
        <textarea
          name="timelines"
          required
          defaultValue={savedData?.timelines}
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        />
      </label>

      <label className="block">
        Time Commitment
        <br />
        <small>How much time are you going to commit to the project?</small>
        <select
          name="commitment"
          required
          defaultValue={savedData?.commitment}
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        >
          <option value="100%">100% - Full Time</option>
          <option value="75%">75% - Part Time</option>
          <option value="50%">50% - Part Time</option>
          <option value="25%">25% - Side Project</option>
        </select>
      </label>

      <hr />
      <h2>Project Budget</h2>

      <label className="block">
        Costs & Proposed Budget *<br />
        <small>
          Current or estimated costs of the project. If you're applying for a
          grant from the general fund, please submit a proposed budget (in USD)
          around how much funding you are requesting and how it will be used.
          Please include the grand total (in USD) to avoid any confusion.
        </small>
        <textarea
          name="proposed_budget"
          required
          defaultValue={savedData?.proposed_budget}
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        />
      </label>

      <label className="inline-flex items-center">
        <input
          type="checkbox"
          name="has_received_funding"
          defaultChecked={savedData?.has_received_funding}
          className="rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        />
        <span className="ml-2">
          Has this project received any prior funding?
        </span>
      </label>

      <label className="block">
        If so, please describe.
        <input
          type="text"
          name="what_funding"
          defaultValue={savedData?.what_funding}
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        />
      </label>

      <hr />
      <h2>Applicant Details</h2>

      <label className="block">
        Your Name *<br />
        <small>Feel free to use your nym.</small>
        <input
          type="text"
          name="your_name"
          required
          placeholder="John Doe"
          defaultValue={savedData?.your_name}
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        />
      </label>

      <label className="block">
        Email *
        <input
          type="email"
          name="email"
          required
          placeholder="satoshin@gmx.com"
          defaultValue={savedData?.email}
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        />
      </label>

      <label className="inline-flex items-center">
        <input
          type="checkbox"
          name="are_you_lead"
          defaultChecked={savedData?.are_you_lead}
          className="rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        />
        <span className="ml-2">
          Are you the Project Lead / Lead Contributor?
        </span>
      </label>

      <label className="block">
        If someone else, please list the project's Lead Contributor or
        Maintainer
        <input
          type="text"
          name="other_lead"
          defaultValue={savedData?.other_lead}
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        />
      </label>

      <label className="block">
        Personal Github (or similar, if applicable)
        <input
          type="text"
          name="personal_github"
          defaultValue={savedData?.personal_github}
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        />
      </label>

      {/* Honeypot field - accessible but hidden */}
      <label className="offscreen-field block">
        Leave this field blank (spam protection)
        <input
          type="text"
          name="organization_website"
          tabIndex={-1}
          autoComplete="off"
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm"
        />
      </label>

      <label className="block">
        Other Contact Details (if applicable)
        <br />
        <small>
          Please list any other relevant contact details you are comfortable
          sharing in case we need to reach out with questions. These could
          include nostr pubkeys, social media handles, etc.
        </small>
        <textarea
          name="other_contact"
          defaultValue={savedData?.other_contact}
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        />
      </label>

      <hr />
      <h2>References & Prior Contributions</h2>

      <label className="block">
        References *<br />
        <small>
          Please list any references from the Bitcoin community or open-source
          space that we could contact for more information on you or your
          project.
        </small>
        <textarea
          name="references"
          required
          defaultValue={savedData?.references}
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        />
      </label>

      <label className="block">
        Prior Contributions
        <br />
        <small>
          Please list any prior contributions to other open-source or
          Bitcoin-related projects.
        </small>
        <textarea
          name="bios"
          defaultValue={savedData?.bios}
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        />
      </label>

      <label className="block">
        Years of Developer Experience
        <input
          type="text"
          name="years_experience"
          defaultValue={savedData?.years_experience}
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        />
      </label>

      <hr />
      <h2>Anything Else We Should Know?</h2>

      <label className="block">
        Feel free to share whatever else might be important.
        <textarea
          name="anything_else"
          defaultValue={savedData?.anything_else}
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
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

      <button
        type="submit"
        disabled={loading}
        className={`rounded-lg px-6 py-3 font-semibold transition-colors ${
          loading
            ? 'cursor-not-allowed bg-gray-300 text-gray-600'
            : isFLOSS
            ? 'bg-orange-500 text-white hover:bg-orange-600'
            : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
        }`}
      >
        {loading ? 'Submitting...' : 'Submit Grant Application'}
      </button>

      {!isFLOSS && (
        <p className="text-sm text-gray-600">
          Please confirm that your project is free and open-source to submit.
        </p>
      )}
    </form>
  )
}
