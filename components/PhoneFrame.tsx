import { ReactNode } from 'react'

const PhoneFrame = ({ children }: { children: ReactNode }) => {
  return (
    <div className="mx-auto my-16 w-full max-w-sm">
      <div className="rounded-[2.25rem] border-[3px] border-gray-800 bg-gray-800 p-[3px] shadow-2xl ring-1 ring-gray-900/10 dark:border-gray-700 dark:bg-gray-900 dark:ring-gray-100/10">
        <div className="overflow-hidden rounded-[2rem] bg-black [&_img]:my-0">
          {children}
        </div>
      </div>
    </div>
  )
}

export default PhoneFrame
