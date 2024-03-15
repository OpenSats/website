import { redirect } from 'next/navigation'

export default function RedirectToNostrFund({ params }) {
  redirect('/funds/nostr')
}
