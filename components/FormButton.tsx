import React from 'react'
import clsx from 'clsx'

interface FormButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'disabled'
  loading?: boolean
  className?: string
}

export default function FormButton({
  variant = 'primary',
  loading = false,
  className,
  children,
  ...rest
}: FormButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-150 ease-in-out focus:outline-none'

  const variantStyles = {
    primary:
      'text-gray-900 bg-orange-500 hover:bg-orange-600 hover:text-white focus:ring-2 focus:ring-offset-2 focus:ring-orange-500',
    disabled: 'text-gray-500 bg-gray-100 cursor-not-allowed',
  }

  const buttonClasses = clsx(baseStyles, variantStyles[variant], className)

  return (
    <button
      className={buttonClasses}
      disabled={loading || variant === 'disabled'}
      {...rest}
    >
      {loading ? (
        <>
          <svg
            className="-ml-1 mr-3 h-4 w-4 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  )
}
