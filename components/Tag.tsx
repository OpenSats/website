import Link from 'next/link'
import { tagLink } from '@/utils/tagLink'

interface Props {
  text: string
  className?: string
}

const Tag = ({ text, className }: Props) => {
  return (
    <Link
      href={tagLink(text)}
      className={
        className ??
        'mr-3 text-sm font-medium uppercase text-primary-500 hover:text-primary-600 dark:hover:text-primary-400'
      }
    >
      {text.split(' ').join('-')}
    </Link>
  )
}

export default Tag
