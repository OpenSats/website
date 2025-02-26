import Link from 'next/link'
import { kebabCase } from 'pliny/utils/kebabCase'
import { usePathname } from 'next/navigation'

interface Props {
  text: string
}

const Tag = ({ text }: Props) => {
  const path = usePathname()
  let tagSegment = `/tags/${kebabCase(text)}`
  if (path.split('/').at(-2) == 'tags') {
    tagSegment = `${path}/${kebabCase(text)}`
  }
  return (
    <Link
      href={tagSegment}
      className="mr-3 text-sm font-medium uppercase text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
    >
      {text.split(' ').join('-')}
    </Link>
  )
}

export default Tag
