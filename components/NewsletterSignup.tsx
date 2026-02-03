import { useRef, useState } from 'react'

interface NewsletterSignupProps {
  title?: string
  subtitle?: string
  apiUrl?: string
}

export default function NewsletterSignup({
  title = 'Subscribe to our Newsletter',
  subtitle = 'Quarterly updates on grantee highlights and the impact your support enables.',
  apiUrl = '/api/newsletter',
}: NewsletterSignupProps) {
  const inputEl = useRef<HTMLInputElement>(null)
  const [error, setError] = useState(false)
  const [message, setMessage] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const subscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const res = await fetch(apiUrl, {
      body: JSON.stringify({
        email: inputEl.current?.value,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    const { error } = await res.json()
    if (error) {
      setError(true)
      setMessage(
        'Your e-mail address is invalid or you are already subscribed!'
      )
      return
    }

    if (inputEl.current) {
      inputEl.current.value = ''
    }
    setError(false)
    setSubscribed(true)
    setMessage('Successfully subscribed!')
  }

  return (
    <div className="w-full bg-gray-100 px-6 py-10 dark:bg-gray-800 sm:px-14 sm:py-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      <p className="mt-1 text-gray-600 dark:text-gray-400">{subtitle}</p>

      <form onSubmit={subscribe} className="mt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-0">
          <input
            ref={inputEl}
            type="email"
            name="email"
            autoComplete="email"
            required
            disabled={subscribed}
            placeholder={subscribed ? "You're subscribed!" : 'Your email'}
            className="flex-1 rounded-md border-0 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 sm:rounded-r-none"
          />
          <button
            type="submit"
            disabled={subscribed}
            className={`rounded-md bg-primary-500 px-6 py-3 font-semibold text-white sm:rounded-l-none ${
              subscribed
                ? 'cursor-default'
                : 'hover:bg-primary-600 dark:hover:bg-primary-400'
            }`}
          >
            {subscribed ? 'Thank you!' : 'Subscribe'}
          </button>
        </div>
      </form>

      {error && (
        <p className="mt-3 text-sm text-red-500 dark:text-red-400">{message}</p>
      )}
      {subscribed && !error && (
        <p className="mt-3 text-sm text-green-600 dark:text-green-400">
          {message}
        </p>
      )}

      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  )
}
