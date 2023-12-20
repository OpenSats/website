import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function SectionContainer({ children }: Props) {
  return (
    <section className="mx-2 max-w-3xl px-4 sm:px-6 lg:mx-auto xl:mx-auto xl:max-w-5xl xl:px-0">
      {children}
    </section>
  )
}
