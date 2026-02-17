import CustomLink from './Link'
import { MONTHLY_DONATION_URL } from '@/utils/constants'

const DESIGNATION_IDS: Record<string, string> = {
  nostr: 'ENWRA6YZ',
  ops: 'ELL6P2J6',
}

type DonateRecurringButtonProps = {
  label?: string
  showHeart?: boolean
  designation?: keyof typeof DESIGNATION_IDS
}

export default function DonateRecurringButton({
  label = 'Give Monthly',
  showHeart = true,
  designation,
}: DonateRecurringButtonProps) {
  const designationId = designation ? DESIGNATION_IDS[designation] : undefined
  const href = designationId
    ? `${MONTHLY_DONATION_URL}?designationId=${designationId}`
    : MONTHLY_DONATION_URL

  return (
    <div className="mb-10 mt-12 flex justify-center">
      <CustomLink
        href={href}
        className="my-15 rounded border border-orange-500 bg-transparent px-8 py-4 text-lg font-semibold no-underline hover:bg-orange-100"
      >
        {label}
        {showHeart && ' 🧡'}
      </CustomLink>
    </div>
  )
}
