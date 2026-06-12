import MultiStepApplicationForm, {
  StepConfig,
} from './grant-application/MultiStepApplicationForm'
import Prerequisites from './grant-application/steps/Prerequisites'
import ApplicantDetails from './grant-application/steps/ApplicantDetails'
import ProjectDetails from './grant-application/steps/ProjectDetails'
import SourceCode from './grant-application/steps/SourceCode'
import Timeline from './grant-application/steps/Timeline'
import Budget from './grant-application/steps/Budget'
import ReferencesReview from './grant-application/steps/ReferencesReview'
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
]

const STEPS: StepConfig[] = [
  {
    id: 'prerequisites',
    title: 'Prerequisites',
    fields: ['read_criteria', 'read_faq', 'has_references', 'free_open_source'],
    render: (props) => <Prerequisites {...props} />,
  },
  {
    id: 'applicant',
    title: 'Applicant',
    fields: ['your_name', 'email'],
    render: (props) => <ApplicantDetails {...props} />,
  },
  {
    id: 'project',
    title: 'Project',
    fields: [
      'main_focus',
      'project_name',
      'short_description',
      'potential_impact',
    ],
    render: (props) => <ProjectDetails {...props} />,
  },
  {
    id: 'references',
    title: 'Written References',
    fields: ['references', 'bios', 'years_experience'],
    render: (props) => <ReferencesReview {...props} />,
  },
  {
    id: 'source',
    title: 'Source Code',
    fields: ['github', 'license'],
    render: (props) => <SourceCode {...props} />,
  },
  {
    id: 'timeline',
    title: 'Timeline',
    fields: ['duration', 'timelines', 'commitment'],
    render: (props) => <Timeline {...props} />,
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

export default function GrantApplicationForm() {
  return (
    <MultiStepApplicationForm
      steps={STEPS}
      hiddenFields={{ general_fund: true }}
      defaultValues={{ duration: '6 months' }}
      submitLabel="Submit Grant Application"
    />
  )
}
