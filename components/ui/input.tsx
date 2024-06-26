import * as React from 'react'
import { LucideIcon } from 'lucide-react'

import { cn } from '../../utils/cn'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, rightIcon, ...props }, ref) => {
    const LeftIcon = leftIcon
    const RightIcon = rightIcon

    return (
      <div className="relative">
        {LeftIcon && (
          <div className="absolute left-1.5 top-1/2 transform -translate-y-1/2">
            <LeftIcon size={18} className="text-muted-foreground" />
          </div>
        )}

        <input
          type={type}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            leftIcon ? 'pl-8' : '',
            rightIcon ? 'pr-8' : '',
            className
          )}
          ref={ref}
          {...props}
        />

        {RightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <RightIcon className="text-muted-foreground" size={18} />
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
