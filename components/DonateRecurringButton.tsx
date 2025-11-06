import CustomLink from './Link'
import { MONTHLY_DONATION_URL } from '@/utils/constants'

export default function DonateRecurringButton() {
  return (
    <div className="mb-10 mt-12 flex justify-center">
      <CustomLink
        href={MONTHLY_DONATION_URL}
        className="my-15 rounded border border-orange-500 bg-transparent px-8 py-4 text-lg font-semibold no-underline hover:bg-orange-100"
      >
        Give Monthly 🧡
      </CustomLink>
    </div>
  )
}
