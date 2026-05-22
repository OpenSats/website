import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Logo from '@/data/logo.svg'
import Wordmark from '@/data/wordmark.svg'
import Link from './Link'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'

interface HeaderProps {
  theme?: 'default' | 'nostr'
  overlay?: boolean
  className?: string
}

const Header = ({
  theme = 'default',
  overlay = false,
  className,
}: HeaderProps) => {
  const navLinkClass = overlay
    ? 'hidden p-1 font-medium text-white sm:p-4 md:inline-block'
    : 'hidden p-1 font-medium text-gray-900 dark:text-gray-100 sm:p-4 md:inline-block'

  const buttonClass =
    theme === 'nostr'
      ? 'rounded border border-purple-500 bg-transparent px-4 py-2 font-semibold text-purple-600 hover:border-transparent hover:bg-purple-600 hover:text-white dark:border-purple-400 dark:text-purple-300 dark:hover:bg-purple-400 dark:hover:text-gray-950'
      : overlay
      ? 'rounded border border-white/90 bg-black/20 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm hover:border-white hover:bg-white hover:text-gray-900 sm:px-4 sm:py-2'
      : 'rounded border border-orange-500 bg-transparent px-4 py-2 font-semibold text-orange-500 hover:border-transparent hover:bg-orange-500 hover:text-white'

  const wordmarkClass = overlay
    ? 'text-white'
    : theme === 'nostr'
    ? 'text-purple-900 dark:text-purple-100'
    : 'text-gray-900 dark:text-gray-100'

  return (
    <header
      className={`flex items-center justify-between ${className ?? 'py-10'}`}
    >
      <div>
        <Link
          href="/"
          aria-label={siteMetadata.headerTitle}
          className="flex items-center"
        >
          <Logo
            className={`block h-7 w-auto lg:hidden ${
              overlay ? 'text-white' : ''
            }`}
          />
          <Wordmark className={`hidden h-6 w-auto lg:block ${wordmarkClass}`} />
        </Link>
      </div>
      <div className="flex items-center gap-3 text-base leading-5 sm:gap-4">
        <div className="block">
          {headerNavLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className={link.isButton ? buttonClass : navLinkClass}
            >
              {link.title}
            </Link>
          ))}
        </div>
        <ThemeSwitch />
        <MobileNav theme={theme} overlay={overlay} />
      </div>
    </header>
  )
}

export default Header
