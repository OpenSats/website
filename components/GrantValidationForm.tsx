import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { fetchPostJSON } from '../utils/api-helpers'
import FormButton from '@/components/FormButton'
import * as EmailValidator from 'email-validator'

interface ValidationResult {
  grant_details: {
    project_name: string
    issue_number: number
  }
  email_hash: string
}

interface GrantValidationFormProps {
  onValidationSuccess: (result: ValidationResult) => void
}

interface GrantValidationFormData {
  grant_id: string
  email: string
}

interface GrantValidationFormErrors {
  grant_id?: {
    type: 'required' | 'pattern'
    message: string
  }
  email?: {
    type: 'required' | 'validate'
    message: string
  }
}

export default function GrantValidationForm({
  onValidationSuccess,
}: GrantValidationFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GrantValidationFormData>()

  const onSubmit = async (data: GrantValidationFormData) => {
    setLoading(true)
    setError(undefined)

    try {
      const response = await fetchPostJSON('/api/validate-grant', data)

      if (response.error) {
        setError(response.error)
        setLoading(false)
        return
      }

      // Check if the response has the new format (valid field)
      if (response.valid === true) {
        // Convert new format to the expected format
        onValidationSuccess({
          grant_details: {
            project_name: response.project_name,
            issue_number: response.issue_number,
          },
          email_hash: response.email_hash,
        })
      } else if (response.grant_details) {
        // Handle old format for backward compatibility
        onValidationSuccess({
          grant_details: response.grant_details,
          email_hash: response.email_hash,
        })
      } else {
        // If neither format matches, show an error
        setError('Invalid response format from server')
      }

      setLoading(false)
    } catch (e) {
      setError('Grant not found, contact support for assistance')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      {/* Grant ID */}
      <div>
        <label
          htmlFor="grant_id"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Grant ID
        </label>
        <input
          {...register('grant_id', {
            required: 'Grant ID is required',
            pattern: {
              value: /^\d{6,7}$/,
              message: 'Grant ID must be a 6-7 digit number',
            },
          })}
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800"
          placeholder="123456"
        />
        {errors.grant_id && (
          <span className="text-sm text-red-600">
            {errors.grant_id.message}
          </span>
        )}
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Email
        </label>
        <input
          {...register('email', {
            required: 'Email is required',
            validate: (value) =>
              EmailValidator.validate(value) || 'Invalid email address',
          })}
          type="email"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800"
          placeholder="you@example.com"
        />
        {errors.email && (
          <span className="text-sm text-red-600">{errors.email.message}</span>
        )}
      </div>

      <div className="flex justify-center">
        <FormButton
          type="submit"
          loading={loading}
          variant={loading ? 'disabled' : 'primary'}
          className="px-8"
        >
          Start Report
        </FormButton>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
