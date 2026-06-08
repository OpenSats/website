import { ReactNode } from 'react'
import { postSectionClasses } from '@/components/post/postShared'

interface Props {
  children: ReactNode
}

export default function SectionContainer({ children }: Props) {
  return <section className={postSectionClasses}>{children}</section>
}
