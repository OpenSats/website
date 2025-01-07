import { useEffect, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

import Link from './CustomLink'
import MobileNav from './MobileNav'
import { fundHeaderNavLinks } from '../data/headerNavLinks'
import MagicLogo from './MagicLogo'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { useFundSlug } from '../utils/use-fund-slug'
import CustomLink from './CustomLink'
import { funds } from '../utils/funds'
import MoneroLogo from './MoneroLogo'
import FiroLogo from './FiroLogo'
import PrivacyGuidesLogo from './PrivacyGuidesLogo'

const Header = () => {
  const router = useRouter()
  const session = useSession()
  const fundSlug = useFundSlug()

  const fund = fundSlug ? funds[fundSlug] : null

  return (
    <header className="flex items-center justify-between py-10">
      <div>
        <Link
          href={fundSlug ? `/${fundSlug}` : '/'}
          aria-label="Home"
          className="flex items-center mr-3 gap-4"
        >
          {!fundSlug && <MagicLogo className="w-12 h-12" />}
          {fundSlug === 'monero' && <MoneroLogo className="w-12 h-12" />}
          {fundSlug === 'firo' && <FiroLogo className="w-12 h-12" />}
          {fundSlug === 'privacyguides' && <PrivacyGuidesLogo className="w-12 h-12" />}
          {fundSlug === 'general' && <MagicLogo className="w-12 h-12" />}

          <span className="text-foreground text-lg font-bold hidden sm:block">
            {fund ? fund.title : 'MAGIC Grants'}
          </span>
        </Link>
      </div>

      <div className="flex gap-2 items-center text-base leading-5">
        {!!fund &&
          fundHeaderNavLinks[fund.slug].map((link) => (
            <CustomLink
              key={link.title}
              href={`/${fundSlug}/${link.href}`}
              className={
                link.isButton
                  ? 'rounded border border-primary bg-transparent px-4 py-2 font-semibold text-primary hover:border-transparent hover:bg-primary hover:text-white'
                  : 'hidden p-1 font-medium text-gray-900 sm:p-4 md:inline-block'
              }
            >
              {link.title}
            </CustomLink>
          ))}

        {!!fund && session.status !== 'authenticated' && (
          <>
            <Link href={`/${fund.slug}/login`}>
              <Button variant="outline" className="w-18 block sm:hidden" size="sm">
                Login
              </Button>

              <Button variant="outline" className="w-24 hidden sm:block">
                Login
              </Button>
            </Link>

            <Link href={`/${fund.slug}/register`}>
              <Button className="w-18 block sm:hidden" size="sm">
                Register
              </Button>

              <Button className="w-24 hidden sm:block">Register</Button>
            </Link>
          </>
        )}

        {/* <ThemeSwitch /> */}

        {!!fund && session.status === 'authenticated' && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarFallback>
                  {session.data.user?.email?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <CustomLink href={`/${fundSlug}/account/my-donations`} className="text-foreground">
                <DropdownMenuItem>My Donations</DropdownMenuItem>
              </CustomLink>
              <CustomLink href={`/${fundSlug}/account/my-memberships`} className="text-foreground">
                <DropdownMenuItem>My Memberships</DropdownMenuItem>
              </CustomLink>
              <CustomLink href={`/${fundSlug}/account/point-history`} className="text-foreground">
                <DropdownMenuItem>Point History</DropdownMenuItem>
              </CustomLink>
              <CustomLink href={`/${fundSlug}/perks`} className="text-foreground">
                <DropdownMenuItem>Perks</DropdownMenuItem>
              </CustomLink>
              <CustomLink href={`/${fundSlug}/account/settings`} className="text-foreground">
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </CustomLink>
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: `/${fundSlug}` })}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {!!fundSlug && <MobileNav />}
      </div>
    </header>
  )
}

export default Header
