import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  title: string
}

export default function PageHeading({ title, children }: Props) {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="items-start space-y-2 pb-8 pt-6 md:space-y-5 xl:grid xl:grid-cols-3 xl:gap-x-8">
        <div></div>
        <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 xl:col-span-2">
          {title}
        </h1>
      </div>
      <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
        {children}
      </div>
    </div>
  )
}
