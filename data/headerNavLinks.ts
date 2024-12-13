import { FundSlug } from '@prisma/client'

export const fundHeaderNavLinks: Record<
  FundSlug,
  { title: string; href: string; isButton: boolean }[]
> = {
  monero: [
    { title: 'Apply', href: 'apply', isButton: false },
    { title: 'FAQs', href: 'faq', isButton: false },
    { title: 'About', href: 'about', isButton: false },
  ],
  firo: [{ title: 'About', href: 'about', isButton: false }],
  privacyguides: [
    { title: 'FAQ', href: 'faq', isButton: false },
    { title: 'About', href: 'about', isButton: false },
  ],
  general: [
    { title: 'FAQs', href: 'faq', isButton: false },
    { title: 'About', href: 'about', isButton: false },
  ],
}
