import Link from 'next/link'
import { useFundSlug } from '../../utils/use-fund-slug'
import CustomLink from '../../components/CustomLink'
import { Button } from '../../components/ui/button'

export default function ThankYou() {
  const fundSlug = useFundSlug()
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
      <h2 className="font-bold">Thank you for your donation!</h2>
      <p>
        If you have any questions or need a donation receipt, please reach out to{' '}
        <CustomLink href="mailto:info@magicgrants.org">info@magicgrants.org</CustomLink>
      </p>

      <br />

      <p>
        <Link href={`/${fundSlug}`}>
          <Button>Return Home</Button>
        </Link>
      </p>
    </div>
  )
}
