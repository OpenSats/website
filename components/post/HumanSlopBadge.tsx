import Link from '@/components/Link'
import Image from '@/components/Image'

export default function HumanSlopBadge() {
  return (
    <Link
      href="/slop"
      className="not-prose inline-flex rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
      aria-label="100% human slop: about our writing"
    >
      <Image
        src="/static/images/badges/human-slop-light.svg"
        darkSrc="/static/images/badges/human-slop-dark.svg"
        alt="100% human slop"
        width={140}
        height={22}
      />
    </Link>
  )
}
