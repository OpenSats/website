import { useState } from 'react'
import Link from './Link'
import headerNavLinks from '@/data/headerNavLinks'

interface MobileNavProps {
  theme?: 'default' | 'nostr'
}

const MobileNav = ({ theme = 'default' }: MobileNavProps) => {
  const [navShow, setNavShow] = useState(false)

  const menuButtonClass =
    theme === 'nostr'
      ? 'flex h-8 w-8 items-center justify-center rounded p-1 text-purple-700 dark:text-purple-300'
      : 'flex h-8 w-8 items-center justify-center rounded p-1 text-gray-900 dark:text-gray-100'

  const overlayClass =
    theme === 'nostr'
      ? 'fixed left-0 top-0 z-10 h-full w-full transform bg-purple-100 opacity-95 duration-300 ease-in-out dark:bg-purple-950'
      : 'fixed left-0 top-0 z-10 h-full w-full transform bg-gray-200 opacity-95 duration-300 ease-in-out dark:bg-gray-800'

  const navLinkClass =
    theme === 'nostr'
      ? 'text-2xl font-bold tracking-tight text-purple-900 dark:text-purple-100'
      : 'text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100'

  const closeIconClass =
    theme === 'nostr'
      ? 'h-8 w-8 text-purple-900 dark:text-purple-100'
      : 'h-8 w-8 text-gray-900 dark:text-gray-100'

  const onToggleNav = () => {
    setNavShow((status) => {
      if (status) {
        document.body.style.overflow = 'auto'
      } else {
        // Prevent scrolling
        document.body.style.overflow = 'hidden'
      }
      return !status
    })
  }

  return (
    <div className="md:hidden">
      <button
        className={menuButtonClass}
        aria-label="Toggle Menu"
        onClick={onToggleNav}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-6 w-6"
        >
          <path
            fillRule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <div
        className={`${overlayClass} ${
          navShow ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-end">
          <button
            className="mr-5 mt-11 h-8 w-8 rounded"
            aria-label="Toggle Menu"
            onClick={onToggleNav}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={closeIconClass}
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <nav className="fixed mt-8 h-full">
          {headerNavLinks.map((link) => (
            <div key={link.title} className="px-12 py-4">
              <Link
                href={link.href}
                className={navLinkClass}
                onClick={onToggleNav}
              >
                {link.title}
              </Link>
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default MobileNav
