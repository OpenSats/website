import { ReactNode } from 'react'

const BrowserFrame = ({
  url,
  children,
}: {
  url?: string
  children: ReactNode
}) => {
  return (
    <div className="my-8 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        {url && (
          <div className="ml-3 flex-1 truncate rounded-md bg-white px-3 py-1 text-xs text-gray-500 dark:bg-gray-900 dark:text-gray-400">
            {url}
          </div>
        )}
      </div>
      <div className="[&_img]:my-0">{children}</div>
    </div>
  )
}

export default BrowserFrame
