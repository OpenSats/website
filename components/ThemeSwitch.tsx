import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  // Cycle through: system → light → dark → system, so users can
  // explicitly opt back into following their OS preference.
  const nextTheme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system'

  const labels: Record<string, string> = {
    system: 'Use system theme (currently active). Click to switch to light mode.',
    light: 'Light mode active. Click to switch to dark mode.',
    dark: 'Dark mode active. Click to follow system theme.',
  }

  const current = mounted && theme ? theme : 'system'

  return (
    <button
      aria-label={labels[current]}
      title={labels[current]}
      className="ml-1 flex h-8 w-8 items-center justify-center rounded p-1 text-gray-900 transition-colors duration-300 dark:text-gray-100 md:ml-0 md:text-gray-400 md:hover:text-gray-900 md:focus-visible:text-gray-900 md:dark:text-gray-600 md:dark:hover:text-gray-100 md:dark:focus-visible:text-gray-100"
      onClick={() => setTheme(nextTheme)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        {!mounted ? null : current === 'light' ? (
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        ) : current === 'dark' ? (
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        ) : (
          <>
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
              clipRule="evenodd"
            />
            <path d="M10 4a6 6 0 010 12V4z" />
          </>
        )}
      </svg>
    </button>
  )
}

export default ThemeSwitch
