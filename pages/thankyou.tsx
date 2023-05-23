import Link from 'next/link'

export default function ThankYou() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8">
      <h2>Thank you for your donation!</h2>
      <p>
        If you have any questions, please reach out to{' '}
        <Link href="mailto:support@opensats.org">support@opensats.org</Link>
      </p>
      .
      <p>
        <Link href="/">Return Home</Link>
      </p>
    </div>
  )
}
