import CustomLink from './Link'
import { MONTHLY_DONATION_URL } from '@/utils/constants'

type DonateRecurringButtonProps = {
  label?: string
  showHeart?: boolean
}

export default function DonateRecurringButton({
  label = 'Give Monthly',
  showHeart = true,
}: DonateRecurringButtonProps) {
  return (
    <div className="mb-10 mt-12 flex justify-center">
      <CustomLink
        href={MONTHLY_DONATION_URL}
        className="my-15 rounded border border-orange-500 bg-transparent px-8 py-4 text-lg font-semibold no-underline hover:bg-orange-100"
      >
        {label}{showHeart && ' 🧡'}
      </CustomLink>
    </div>
  )
}
