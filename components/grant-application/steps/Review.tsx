import { UseFormWatch } from 'react-hook-form'
import { FormValues } from '../types'

interface ReviewProps {
  watch: UseFormWatch<FormValues>
}

function ReviewField({
  label,
  value,
}: {
  label: string
  value: string | undefined
}) {
  if (!value) return null
  return (
    <div>
      <dt className="font-medium text-gray-900 dark:text-white">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap">{value}</dd>
    </div>
  )
}

function ReviewSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h3 className="mb-3 text-lg font-semibold">{title}</h3>
      <dl className="space-y-3">{children}</dl>
    </section>
  )
}

export default function Review({ watch }: ReviewProps) {
  const values = watch()

  return (
    <>
      <div className="rounded-b border-t-4 border-orange-500 bg-yellow-100 px-4 py-3 text-yellow-900 shadow-md">
        <p className="text-sm font-medium">
          Please review your application carefully before submitting.
        </p>
      </div>

      <div className="space-y-6">
        <ReviewSection title="Applicant">
          <ReviewField label="Name" value={values.your_name as string} />
          <ReviewField label="Email" value={values.email as string} />
          <ReviewField
            label="Personal GitHub"
            value={values.personal_github as string}
          />
          <ReviewField
            label="Other Contact Details"
            value={values.other_contact as string}
          />
          <ReviewField
            label="Lead Developer"
            value={
              values.are_you_lead
                ? 'I am the lead developer or maintainer'
                : (values.other_lead as string) || undefined
            }
          />
        </ReviewSection>

        <hr />

        <ReviewSection title="Project">
          <ReviewField label="Main Focus" value={values.main_focus as string} />
          <ReviewField
            label="Project Name"
            value={values.project_name as string}
          />
          <ReviewField
            label="Project Description"
            value={values.short_description as string}
          />
          <ReviewField
            label="Potential Impact"
            value={values.potential_impact as string}
          />
        </ReviewSection>

        <hr />

        <ReviewSection title="Written References">
          <ReviewField label="References" value={values.references as string} />
          <ReviewField
            label="Prior Contributions"
            value={values.bios as string}
          />
          <ReviewField
            label="Years of Developer Experience"
            value={values.years_experience as string}
          />
        </ReviewSection>

        <hr />

        <ReviewSection title="Source Code">
          <ReviewField label="Repository" value={values.github as string} />
          <ReviewField label="License" value={values.license as string} />
          <ReviewField
            label="Project Website"
            value={values.website as string}
          />
          <ReviewField
            label="Screenshots / Videos"
            value={values.screenshots_videos as string}
          />
        </ReviewSection>

        <hr />

        <ReviewSection title="Timeline">
          <ReviewField label="Duration" value={values.duration as string} />
          <ReviewField
            label="Time Commitment"
            value={values.commitment as string}
          />
          <ReviewField label="Milestones" value={values.timelines as string} />
        </ReviewSection>

        <hr />

        <ReviewSection title="Budget">
          <ReviewField
            label="Costs & Proposed Budget"
            value={values.proposed_budget as string}
          />
          <ReviewField
            label="Prior Funding"
            value={
              values.has_received_funding === 'yes'
                ? (values.what_funding as string)
                : values.has_received_funding === 'no'
                ? 'No'
                : undefined
            }
          />
          <ReviewField
            label="Additional Funding Sources"
            value={
              values.has_additional_funding === 'yes'
                ? (values.additional_funding as string)
                : values.has_additional_funding === 'no'
                ? 'No'
                : undefined
            }
          />
        </ReviewSection>

        <hr />

        <ReviewSection title="Anything Else">
          <ReviewField
            label="Video Application"
            value={values.video_application as string}
          />
          <ReviewField
            label="Anything Else"
            value={values.anything_else as string}
          />
        </ReviewSection>
      </div>
    </>
  )
}
