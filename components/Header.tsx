import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Logo from '@/data/logo.svg'
import Wordmark from '@/data/wordmark.svg'
import Link from './Link'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'

const Header = () => {
  return (
    <header className="flex items-center justify-between py-10">
      <div>
        <Link
          href="/"
          aria-label={siteMetadata.headerTitle}
          className="flex items-center"
        >
          <Logo className="block h-9 w-auto lg:hidden" />
          <Wordmark className="hidden h-9 w-auto text-gray-900 dark:text-gray-100 lg:block" />
        </Link>
      </div>
      <div className="flex items-center text-base leading-5">
        <div className="block">
          {headerNavLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className={
                link.isButton
                  ? 'rounded border border-orange-500 bg-transparent px-4 py-2 font-semibold text-orange-500 hover:border-transparent hover:bg-orange-500 hover:text-white'
                  : 'hidden p-1 font-medium text-gray-900 dark:text-gray-100 sm:p-4 md:inline-block'
              }
            >
              {link.title}
            </Link>
          ))}
        </div>
        <ThemeSwitch />
        <MobileNav />
      </div>
    </header>
  )
}

export default Header
