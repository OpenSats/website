import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { fetchPostJSON } from '../utils/api-helpers'
import * as EmailValidator from 'email-validator'
import { ERROR_MESSAGES } from '../utils/constants'

interface ValidationResult {
  grant_details: {
    project_name: string
    issue_number: number
    grant_id: string
    email: string
  }
}

interface GrantValidationFormProps {
  onValidationSuccess: (result: ValidationResult) => void
}

interface GrantValidationFormData {
  grant_id: string
  email: string
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
  } = useForm<GrantValidationFormData>({
    mode: 'onBlur',
  })

  const onSubmit = async (data: GrantValidationFormData) => {
    setLoading(true)
    setError(undefined)

    try {
      const response = await fetchPostJSON('/api/grant', data)

      if (response.error) {
        setError(response.error)
        setLoading(false)
        return
      }

      // Check if the response has the valid field
      if (response.valid === true) {
        onValidationSuccess({
          grant_details: {
            project_name: response.project_name,
            issue_number: response.issue_number,
            grant_id: data.grant_id,
            email: data.email,
          },
        })
      } else if (response.grant_details) {
        // Handle old format for backward compatibility
        onValidationSuccess({
          grant_details: {
            ...response.grant_details,
            grant_id: data.grant_id,
            email: data.email,
          },
        })
      } else {
        // If neither format matches, show an error
        setError('Invalid response format from server')
      }

      setLoading(false)
    } catch (e) {
      setError(ERROR_MESSAGES.GRANT_NOT_FOUND)
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="apply flex max-w-2xl flex-col gap-4"
    >
      <hr />
      <label className="block">
        Grant ID *
        <br />
        <small>
          The number that your grant got assigned. You can find it on the first
          page of your signed Grant Agreement.
        </small>
        <input
          {...register('grant_id', {
            required: 'Grant ID is required',
            pattern: {
              value: /^\d{6,7}$/,
              message:
                'A valid Grant ID is required to start the submission process',
            },
          })}
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          placeholder="123456"
        />
        {errors.grant_id && (
          <small className="text-red-500">{errors.grant_id.message}</small>
        )}
      </label>

      <label className="block">
        Email *
        <br />
        <small>The email address associated with your grant application.</small>
        <input
          {...register('email', {
            required: 'Email is required',
            validate: (value) =>
              EmailValidator.validate(value) || 'Invalid email address',
          })}
          type="email"
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          placeholder="satoshin@gmx.com"
        />
        {errors.email && (
          <small className="text-red-500">{errors.email.message}</small>
        )}
      </label>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className={`rounded px-4 py-2 text-sm font-medium text-white ${
            loading
              ? 'cursor-not-allowed bg-gray-400'
              : 'bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2'
          }`}
        >
          {loading ? (
            'Validating...'
          ) : (
            <span className="flex items-center">
              Next Step
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="ml-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900">
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
