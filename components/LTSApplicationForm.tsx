import MultiStepApplicationForm, {
  StepConfig,
} from './grant-application/MultiStepApplicationForm'
import Prerequisites from './grant-application/steps/Prerequisites'
import ApplicantDetails from './grant-application/steps/ApplicantDetails'
import LtsWork from './grant-application/steps/LtsWork'
import ReferencesReview from './grant-application/steps/ReferencesReview'
import Budget from './grant-application/steps/Budget'
import AnythingElse from './grant-application/steps/AnythingElse'
import Review, { ReviewSection } from './grant-application/steps/Review'

const REVIEW_SECTIONS: ReviewSection[] = [
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
    title: 'Work',
    fields: [
      ['Main Focus', 'main_focus'],
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
]

const STEPS: StepConfig[] = [
  {
    id: 'prerequisites',
    title: 'Prerequisites',
    fields: [
      'read_criteria',
      'read_faq',
      'has_references',
      'free_open_source',
      'lts_right_fit',
    ],
    render: (props) => <Prerequisites {...props} />,
  },
  {
    id: 'applicant',
    title: 'Applicant',
    fields: ['your_name', 'email'],
    render: (props) => <ApplicantDetails {...props} />,
  },
  {
    id: 'work',
    title: 'Work',
    fields: ['main_focus', 'short_description', 'potential_impact'],
    render: (props) => <LtsWork {...props} />,
  },
  {
    id: 'references',
    title: 'Written References',
    fields: ['references', 'bios', 'years_experience'],
    render: (props) => <ReferencesReview {...props} />,
  },
  {
    id: 'budget',
    title: 'Budget',
    fields: [
      'proposed_budget',
      'has_received_funding',
      'what_funding',
      'has_additional_funding',
      'additional_funding',
    ],
    render: (props) => <Budget {...props} />,
  },
  {
    id: 'anything_else',
    title: 'Final',
    fields: ['no_vibed_garbage', 'human_in_charge', 'discipline_and_agency'],
    render: (props) => <AnythingElse {...props} />,
  },
  {
    id: 'review',
    title: 'Review',
    fields: [],
    render: (props) => (
      <Review watch={props.watch} sections={REVIEW_SECTIONS} />
    ),
  },
]

export default function LTSApplicationForm() {
  return (
    <MultiStepApplicationForm
      steps={STEPS}
      hiddenFields={{
        project_name: 'Long-term Grant',
        timelines: 'Ongoing work (LTS Grant).',
        LTS: true,
      }}
      submitLabel="Submit LTS Application"
    />
  )
}
