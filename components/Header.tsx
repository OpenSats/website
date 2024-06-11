import { useState } from 'react'

import Link from './CustomLink'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import headerNavLinks from '../data/headerNavLinks'
import Logo from './Logo'
import { Dialog, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import RegisterFormModal from './RegisterFormModal'

const Header = () => {
  const [registerIsOpen, setRegisterIsOpen] = useState(false)

  return (
    <header className="flex items-center justify-between py-10">
      <div>
        <Link
          href="/"
          aria-label="Monero Fund"
          className="flex items-center mr-3 gap-4"
        >
          <Logo className="w-12 h-12" />
          <span className="text-lg font-bold">MAGIC Monero Fund</span>
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

          <Dialog open={registerIsOpen} onOpenChange={setRegisterIsOpen}>
            <DialogTrigger asChild>
              <Button>Register</Button>
            </DialogTrigger>
            <RegisterFormModal close={() => setRegisterIsOpen(false)} />
          </Dialog>
        </div>
        <ThemeSwitch />
        <MobileNav />
      </div>
    </header>
  )
}

export default Header
