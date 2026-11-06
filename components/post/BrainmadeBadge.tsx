import Link from '@/components/Link'
import Image from '@/components/Image'

export default function BrainmadeBadge() {
  return (
    <Link
      href="https://brainmade.org/"
      className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
      aria-label="Brainmade: human-created writing"
    >
      <Image
        src="/static/images/badges/brainmade-light.svg"
        darkSrc="/static/images/badges/brainmade.svg"
        alt="Brainmade"
        width={87}
        height={20}
      />
    </Link>
  )
}
