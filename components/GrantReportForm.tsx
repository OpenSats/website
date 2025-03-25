import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { fetchPostJSON } from '../utils/api-helpers'
import FormButton from '@/components/FormButton'
import CustomLink from '@/components/Link'
import { useRouter } from 'next/router'
import ReportPreview from '@/components/ReportPreview'
import CryptoJS from 'crypto-js'

interface GrantReportFormProps {
  grantDetails: {
    project_name: string
    issue_number: number
  }
  email_hash: string
}

interface GrantReportFormData {
  project_name: string
  report_number: string
  time_spent: string
  next_quarter: string
  money_usage: string
  help_needed?: string
}

// Encryption key for local storage (in a real app, this would be more securely managed)
const STORAGE_KEY = 'opensats_report_draft'
const ENCRYPTION_KEY = 'opensats_secure_storage'
// Set expiration time for saved data (30 days in milliseconds)
const STORAGE_EXPIRATION = 30 * 24 * 60 * 60 * 1000

export default function GrantReportForm({ grantDetails, email_hash }: GrantReportFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string>()
  const [showPreview, setShowPreview] = useState(false)
  const [recoveredData, setRecoveredData] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    getValues,
    reset,
  } = useForm<GrantReportFormData>({
    defaultValues: {
      project_name: grantDetails.project_name,
      report_number: '',
      time_spent: '',
      next_quarter: '',
      money_usage: '',
      help_needed: ''
    }
  })

  // Watch all form fields for preview
  const watchAllFields = watch()

  // Clear all saved report data for this grant
  const clearSavedData = () => {
    try {
      // Find all keys in localStorage that match the pattern for this grant
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(`${STORAGE_KEY}_${grantDetails.issue_number}`)) {
          keysToRemove.push(key)
        }
      }
      
      // Remove all matching keys
      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      return keysToRemove.length > 0
    } catch (e) {
      console.error('Error clearing saved form data:', e)
      return false
    }
  }

  // Load saved form data from localStorage on initial render
  useEffect(() => {
    try {
      const storageKey = `${STORAGE_KEY}_${grantDetails.issue_number}_${watchAllFields.report_number || 'draft'}`
      const savedData = localStorage.getItem(storageKey)
      
      if (savedData) {
        // Decrypt the data
        const decryptedBytes = CryptoJS.AES.decrypt(savedData, ENCRYPTION_KEY)
        const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8)
        
        if (decryptedText) {
          const decryptedData = JSON.parse(decryptedText)
          
          // Check if the data has expired
          if (decryptedData.timestamp && (Date.now() - decryptedData.timestamp > STORAGE_EXPIRATION)) {
            // Data has expired, remove it
            localStorage.removeItem(storageKey)
            return
          }
          
          // Set form values from saved data
          if (decryptedData.formData) {
            Object.keys(decryptedData.formData).forEach((key) => {
              setValue(key as keyof GrantReportFormData, decryptedData.formData[key])
            })
            setRecoveredData(true)
          }
        }
      }
    } catch (e) {
      console.error('Error loading saved form data:', e)
      // If there's an error, we just continue with empty form
    }
  }, [grantDetails.issue_number, setValue])

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (isDirty && watchAllFields.report_number) {
      try {
        const formData = getValues()
        const storageKey = `${STORAGE_KEY}_${grantDetails.issue_number}_${watchAllFields.report_number}`
        
        // Store data with timestamp for expiration checking
        const dataToStore = {
          formData,
          timestamp: Date.now()
        }
        
        // Encrypt the data before storing
        const encryptedData = CryptoJS.AES.encrypt(
          JSON.stringify(dataToStore),
          ENCRYPTION_KEY
        ).toString()
        
        localStorage.setItem(storageKey, encryptedData)
        
        // Remove draft data if we have a report number
        if (watchAllFields.report_number) {
          localStorage.removeItem(`${STORAGE_KEY}_${grantDetails.issue_number}_draft`)
        }
      } catch (e) {
        console.error('Error saving form data:', e)
      }
    }
  }, [watchAllFields, grantDetails.issue_number, isDirty, getValues])

  const onSubmit = async (data: GrantReportFormData) => {
    setLoading(true)
    setError(undefined)

    try {
      const response = await fetchPostJSON('/api/submit-report', {
        ...data,
        issue_number: grantDetails.issue_number,
        email_hash,
      })

      if (response.error) {
        setError(response.error)
        setLoading(false)
        return
      }

      // Clear all saved form data for this grant after successful submission
      clearSavedData()
      
      setSubmitted(true)
      setLoading(false)
      router.push('/reports/success')
    } catch (e) {
      setError('Error submitting report. Your data has been saved locally. Please try again later.')
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center">
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Your report has been submitted successfully.
        </p>
        <p className="mt-4">
          <CustomLink href="/reports/submit" className="text-orange-500 hover:text-orange-600">
            Submit another report
          </CustomLink>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      {/* Instructions */}
      <div className="rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 p-5 border-l-4 border-orange-500 shadow-sm">
        <div className="flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-base font-medium text-gray-800 dark:text-gray-200">
            Refer to our{' '}
            <CustomLink href="https://opensats.org/faq/grantee" className="font-bold">Grantee FAQ</CustomLink>{' '}
            or <a href="#guidelines" className="font-bold text-orange-500 hover:text-orange-600">guidelines below</a> for help building a quality progress report.
            Format your report in markdown.
          </p>
        </div>
      </div>

      {recoveredData && (
        <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900 border border-blue-200 dark:border-blue-800">
          <div className="flex">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Recovered Data
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>We've recovered your previously entered data. You can continue editing or submit it.</p>
              </div>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => {
                    clearSavedData();
                    reset({
                      project_name: grantDetails.project_name,
                      report_number: '',
                      time_spent: '',
                      next_quarter: '',
                      money_usage: '',
                      help_needed: ''
                    });
                    setRecoveredData(false);
                  }}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear saved data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Name */}
      <div>
        <label
          htmlFor="project_name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Project Name
        </label>
        <input
          {...register('project_name', { required: 'Project name is required' })}
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800"
          disabled
        />
        {errors.project_name && (
          <span className="text-sm text-red-600">{errors.project_name.message}</span>
        )}
      </div>

      {/* Progress Report # */}
      <div>
        <label
          htmlFor="report_number"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Progress Report #
        </label>
        <input
          {...register('report_number', { 
            required: 'Report number is required',
            pattern: {
              value: /^\d+$/,
              message: 'Report number must be a number'
            }
          })}
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800"
          placeholder="1, 2, 3, etc"
        />
        {errors.report_number && (
          <span className="text-sm text-red-600">{errors.report_number.message}</span>
        )}
      </div>

      {/* Project Updates */}
      <div>
        <label
          htmlFor="time_spent"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Project Updates
        </label>
        <textarea
          {...register('time_spent', { required: 'Project updates are required' })}
          rows={8}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 font-mono text-sm"
          placeholder="Describe your progress and accomplishments since the last report. Include links to pull requests, commits, and other work."
        />
        {errors.time_spent && (
          <span className="text-sm text-red-600">{errors.time_spent.message}</span>
        )}
      </div>

      {/* Plans for Next Quarter */}
      <div>
        <label
          htmlFor="next_quarter"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Plans for Next Quarter
        </label>
        <textarea
          {...register('next_quarter', { required: 'Plans for Next Quarter are required' })}
          rows={6}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 font-mono text-sm"
          placeholder="Outline your goals and plans for the next quarter. Be specific about what you aim to accomplish."
        />
        {errors.next_quarter && (
          <span className="text-sm text-red-600">{errors.next_quarter.message}</span>
        )}
      </div>

      {/* Use of Funds */}
      <div>
        <label
          htmlFor="money_usage"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Use of Funds
        </label>
        <textarea
          {...register('money_usage', { required: 'Use of funds information is required' })}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 font-mono text-sm"
          placeholder="Required for legal and compliance reasons. If using for living expenses, simply stating 'living expenses' is sufficient. For project-related expenses, please provide categories (e.g., office expenses, travel, server costs, etc.)."
        />
        {errors.money_usage && (
          <span className="text-sm text-red-600">{errors.money_usage.message}</span>
        )}
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          We strongly encourage you to keep records. Receipts, invoices, bank statements, etc. If OpenSats is ever audited, you must be able to send supporting information on how you used your grant proceeds.
        </p>
      </div>

      {/* Support needed */}
      <div>
        <label
          htmlFor="help_needed"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Is there anything we could help with?
        </label>
        <textarea
          {...register('help_needed')}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 font-mono text-sm"
          placeholder="Optional. We're here to help! Let us know if you need any technical assistance, introductions, or have other questions."
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900 border border-red-200 dark:border-red-800">
          <div className="flex">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Submission Error
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showPreview ? (
        <div className="flex justify-end">
          <FormButton type="button" onClick={() => setShowPreview(true)}>
            Preview Report
          </FormButton>
        </div>
      ) : (
        <>
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Report Preview
            </h2>
            
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-5 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Report Preview</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                This is how your report will appear when submitted. Please review it carefully before submitting.
              </p>
              <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-md overflow-hidden">
                <ReportPreview data={watchAllFields} />
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                Back to Edit
              </button>
              <FormButton type="submit" loading={loading}>
                Submit Report
              </FormButton>
            </div>
          </div>
        </>
      )}

      {/* Guidelines */}
      <div id="guidelines" className="mt-8 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          <CustomLink href="https://opensats.org/faq/grantee#what-does-an-ideal-progress-report-look-like">Guidelines</CustomLink>
        </h3>
        
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-medium text-gray-900 dark:text-gray-100">What does an ideal progress report look like?</h4>
              <p className="mt-2 text-gray-700 dark:text-gray-300">An ideal progress report is:</p>
              <ul className="mt-2 list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
                <li>Written in Markdown format</li>
                <li>Between 1 and 3 pages</li>
                <li>Enriched with the most relevant links to pull requests, commits, and other work produced</li>
              </ul>
              
              <p className="mt-4 text-gray-700 dark:text-gray-300">In the best case, each progress report:</p>
              <ul className="mt-2 list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
                <li>Has a brief summary in each section before providing additional details</li>
                <li>Tells us if you are on track</li>
                <li>Describes challenges, and how you overcame them</li>
                <li>Includes if you are pleased or displeased with the progress you made</li>
              </ul>
              
              <p className="mt-4 text-gray-700 dark:text-gray-300">Every progress report should show clearly the connection between what was planned in the application or previous report(s) and the work done since.</p>
              
              <p className="mt-4 text-gray-700 dark:text-gray-300">We encourage you to openly discuss any obstacles that may have prevented you from reaching previously established milestones, and/or why your previously outlined plans changed. Remember that we're here to help, not to judge.</p>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-base font-medium text-gray-900 dark:text-gray-100">What does a poor progress report look like?</h4>
              <p className="mt-2 text-gray-700 dark:text-gray-300">A poor progress report is:</p>
              <ul className="mt-2 list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
                <li>Hard to read</li>
                <li>Hard to understand</li>
                <li>An incredibly long wall of text</li>
                <li>Not showing any of the actual work done</li>
                <li>Missing links to pull requests and commits</li>
                <li>Missing context, summaries, and explanations, i.e. is only a long list of links to pull requests and commits without anything else</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
