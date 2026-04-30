import Link from '@/components/Link'
import { faHeartPulse } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface Props {
  href?: string
  label?: string
}

export default function ViewHeartbeatButton({
  href = '/heartbeat',
  label = 'Open Heartbeat',
}: Props) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="not-prose mx-auto my-6 flex w-fit items-center justify-center gap-2 rounded border border-stone-800 bg-transparent px-8 py-2.5 font-semibold text-stone-800 no-underline hover:border-transparent hover:bg-orange-500 hover:text-stone-800 dark:border-white dark:text-white dark:hover:bg-orange-500 dark:hover:text-black"
    >
      <FontAwesomeIcon icon={faHeartPulse} className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  )
}
