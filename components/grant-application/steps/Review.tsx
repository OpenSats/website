import { UseFormWatch } from 'react-hook-form'
import { FormValues } from '../types'

export interface ReviewSection {
  title: string
  fields: readonly (readonly [string, string])[]
}

interface ReviewProps {
  watch: UseFormWatch<FormValues>
  sections: readonly ReviewSection[]
}

const formatValue = (value: unknown) => {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'string') return value.trim()
  return ''
}

export default function Review({ watch, sections }: ReviewProps) {
  const values = watch()

  return (
    <>
      <h2>Review Your Application</h2>
      <p>
        Please review your application carefully. Use Back or the completed step
        indicators to make changes before submitting.
      </p>

      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.title}>
            <h3>{section.title}</h3>
            <dl className="space-y-3">
              {section.fields.map(([label, name]) => {
                const value = formatValue(values[name])
                if (!value) return null

                return (
                  <div key={name}>
                    <dt className="font-medium text-gray-900 dark:text-white">
                      {label}
                    </dt>
                    <dd className="mt-1 whitespace-pre-wrap">{value}</dd>
                  </div>
                )
              })}
            </dl>
          </section>
        ))}
      </div>
    </>
  )
}
