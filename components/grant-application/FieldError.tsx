import { FieldErrors } from 'react-hook-form'

interface FieldErrorProps {
  errors: FieldErrors
  name: string
  message?: string
}

export default function FieldError({
  errors,
  name,
  message = 'This field is required',
}: FieldErrorProps) {
  const error = errors[name]
  if (!error) return null

  const text =
    typeof error.message === 'string' && error.message.length > 0
      ? error.message
      : message

  return <small className="block text-red-500">{text}</small>
}
