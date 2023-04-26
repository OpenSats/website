import Link from 'next/link'

export default function ThankYou() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
            <h2>Thank you for your donation!</h2>
            <p>
                If you have any questions, please reach out to{' '}
                <a href="mailto:support@opensats.org">support@opensats.org</a>
            </p>
            .
            <p>
                <Link href="/">Return Home</Link>
            </p>
        </div>
    )
}
