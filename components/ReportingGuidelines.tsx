export default function ReportingGuidelines() {
  return (
    <div id="guidelines" className="mb-8">
      <h2>Reporting Guidelines</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
            What does an ideal progress report look like?
          </h3>
          <p className="mt-2 text-gray-700 dark:text-gray-300">
            An ideal progress report is:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700 dark:text-gray-300">
            <li>Written in Markdown format</li>
            <li>Between 1 and 3 pages</li>
            <li>
              Enriched with the most relevant links to pull requests, commits,
              and other work produced
            </li>
          </ul>

          <p className="mt-4 text-gray-700 dark:text-gray-300">
            In the best case, each progress report:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700 dark:text-gray-300">
            <li>
              Has a brief summary in each section before providing additional
              details
            </li>
            <li>Tells us if you are on track</li>
            <li>Describes challenges, and how you overcame them</li>
            <li>
              Includes if you are pleased or displeased with the progress you
              made
            </li>
          </ul>

          <p className="mt-4 text-gray-700 dark:text-gray-300">
            Every progress report should show clearly the connection between
            what was planned in the application or previous report(s) and the
            work done since.
          </p>

          <p className="mt-4 text-gray-700 dark:text-gray-300">
            We encourage you to openly discuss any obstacles that may have
            prevented you from reaching previously established milestones,
            and/or why your previously outlined plans changed. Remember that
            we're here to help, not to judge.
          </p>
        </div>

        <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
            What does a poor progress report look like?
          </h3>
          <p className="mt-2 text-gray-700 dark:text-gray-300">
            A poor progress report is:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700 dark:text-gray-300">
            <li>Hard to read</li>
            <li>Hard to understand</li>
            <li>An incredibly long wall of text</li>
            <li>Not showing any of the actual work done</li>
            <li>Missing links to pull requests and commits</li>
            <li>
              Missing context, summaries, and explanations, i.e. is only a
              long list of links to pull requests and commits without anything
              else
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
} 