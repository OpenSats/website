import { ReactNode } from 'react'
import Image from '@/components/Image'

interface Props {
  children: ReactNode,
  title: String
}

export default function PageHeading({ title, children }: Props) {

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 pt-6 pb-8 md:space-y-5">
        <div></div>
        <h1 className="text-3xl xl:col-span-2 font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
          {title}
        </h1>
      </div>
      <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
        { children }
      </div>
    </div>
  )
}
