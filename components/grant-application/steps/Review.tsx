import { UseFormWatch } from 'react-hook-form'
import { FormValues } from '../types'

interface ReviewProps {
  watch: UseFormWatch<FormValues>
}

const sections = [
  {
    title: 'Applicant',
    fields: [
      ['Your Name', 'your_name'],
      ['Email', 'email'],
      ['Personal GitHub', 'personal_github'],
      ['Other Contact Details', 'other_contact'],
      ['Lead Developer or Maintainer', 'are_you_lead'],
      ['Project Lead', 'other_lead'],
    ],
  },
  {
    title: 'Project',
    fields: [
      ['Main Focus', 'main_focus'],
      ['Project Name', 'project_name'],
      ['Project Description', 'short_description'],
      ['Potential Impact', 'potential_impact'],
    ],
  },
  {
    title: 'Written References',
    fields: [
      ['References', 'references'],
      ['Prior Contributions', 'bios'],
      ['Years of Developer Experience', 'years_experience'],
    ],
  },
  {
    title: 'Source Code',
    fields: [
      ['Repository', 'github'],
      ['Open-Source License', 'license'],
      ['Project Website', 'website'],
      ['Screenshots / Videos', 'screenshots_videos'],
    ],
  },
  {
    title: 'Timeline',
    fields: [
      ['Duration', 'duration'],
      ['Time Commitment', 'commitment'],
      ['Project Timeline and Potential Milestones', 'timelines'],
    ],
  },
  {
    title: 'Budget',
    fields: [
      ['Costs & Proposed Budget', 'proposed_budget'],
      ['Prior Funding', 'has_received_funding'],
      ['Prior Funding Details', 'what_funding'],
      ['Additional Funding Sources', 'has_additional_funding'],
      ['Additional Funding Details', 'additional_funding'],
    ],
  },
  {
    title: 'Final',
    fields: [
      ['Video Application', 'video_application'],
      ['Anything Else', 'anything_else'],
    ],
  },
] as const

const formatValue = (value: unknown) => {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'string') return value.trim()
  return ''
}

export default function Review({ watch }: ReviewProps) {
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
