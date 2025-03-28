import React, { ReactNode } from 'react'

interface FormButtonProps {
  variant?: 'enabled' | 'disabled'
  children: ReactNode
  loading?: boolean
  [x: string]: any
}

function FormButton({ variant = 'enabled', children, loading = false, ...rest }: FormButtonProps) {
  const defaultVariant =
    'bg-orange-500 hover:bg-orange-700 text-xl text-white font-bold py-2 px-4 rounded'
  const buttonVariants = {
    enabled: defaultVariant,
    disabled: `${defaultVariant} opacity-50 cursor-not-allowed`,
  }

  // Disable the button when loading
  const isDisabled = variant === 'disabled' || loading
  const props = {
    ...rest,
    disabled: isDisabled,
  }

  return (
    <button className={`${buttonVariants[variant]} ${rest.className || ''}`} {...props}>
      {loading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  )
}

export default FormButton
