import Link from 'next/link'
import { slug as kebabCase } from 'github-slugger'

interface Props {
  text: string
  className?: string
}

const Tag = ({ text, className }: Props) => {
  return (
    <Link
      href={`/tags/${kebabCase(text)}`}
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
