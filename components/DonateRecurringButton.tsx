import CustomLink from './Link'
import { MONTHLY_DONATION_URL } from '@/utils/constants'

type DonateRecurringButtonProps = {
  label?: string
  showHeart?: boolean
  designationId?: string
}

export default function DonateRecurringButton({
  label = 'Give Monthly',
  showHeart = true,
  designationId,
}: DonateRecurringButtonProps) {
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
