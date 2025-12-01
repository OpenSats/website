import Link from './Link'

const ClosedNotice = () => {
  return (
    <div
      className="rounded-b border-t-4 border-orange-500 bg-yellow-100 px-4 py-3 text-yellow-900 shadow-md"
      role="alert"
    >
      <div className="flex">
        <div className="py-1">
          <svg
            className="mr-4 h-6 w-6 fill-current text-orange-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
          </svg>
        </div>
        <div>
          <p className="font-bold">Applications are currently closed!</p>
          <p className="text-sm">
            Grant applications are currently closed as per our{' '}
            <Link href="/faq#when-is-the-best-time-to-apply">
              quarterly schedule
            </Link>
            . Please have a look at{' '}
            <Link href="/blog/2024-year-in-review">last year's report</Link> to
            see what kind of projects we support.
          </p>
          <p className="text-sm">
            If you want to prepare a submission, please get familiar with our{' '}
            <Link href="/apply#critera">application criteria</Link> as well as
            our <Link href="/selection">grant selection process</Link>.
          </p>
          <p className="text-sm">
            We will re-open applications on the 1st week of next month.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ClosedNotice
