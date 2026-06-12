import { FieldErrors } from 'react-hook-form'

interface CheckboxGroupErrorProps {
  errors: FieldErrors
  names: readonly string[]
  message?: string
}

export default function CheckboxGroupError({
  errors,
  names,
  message = 'You must acknowledge all of the above.',
}: CheckboxGroupErrorProps) {
  const hasError = names.some((name) => errors[name])
  if (!hasError) return null

  return <small className="block text-red-500">{message}</small>
}
