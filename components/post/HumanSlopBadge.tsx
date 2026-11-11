import Link from '@/components/Link'
import Image from '@/components/Image'

export default function HumanSlopBadge() {
  return (
    <Link
      href="/about#content"
      className="not-prose inline-flex rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
      aria-label="100% human slop — meet our content team"
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
