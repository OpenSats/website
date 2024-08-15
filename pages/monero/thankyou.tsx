import Link from 'next/link'

export default function ThankYou() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
      <h2>Thank you for your donation!</h2>
      <p>
        If you have any questions, please reach out to{' '}
        <a
          className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
          href="mailto:info@magicgrants.org"
        >
          info@magicgrants.org
        </a>
      </p>

      <br />

      <p>
        <Link
          className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
          href="/"
        >
          Return Home
        </Link>
      </p>
    </div>
  )
}
