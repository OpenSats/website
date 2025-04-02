interface FormButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'enabled' | 'disabled' | 'primary'
  loading?: boolean
  children?: React.ReactNode
}

function FormButton({
  variant = 'primary',
  loading = false,
  children,
  className = '',
  ...rest
}: FormButtonProps) {
  const defaultVariant =
    'inline-flex justify-center items-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 ease-in-out border-0'
  const buttonVariants = {
    enabled: defaultVariant,
    disabled: `${defaultVariant} cursor-not-allowed opacity-50`,
    primary: defaultVariant,
  }

  return (
    <button
      className={`${buttonVariants[variant]} ${
        loading ? 'cursor-not-allowed opacity-50' : ''
      } ${className}`}
      disabled={loading}
      type="submit"
      {...rest}
    >
      {loading ? (
        <span className="flex w-full items-center justify-center">
          <svg
            className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
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
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </span>
      ) : (
        <span className="flex w-full items-center justify-center">
          {children || 'Submit'}
        </span>
      )}
    </button>
  )
}

export default FormButton
