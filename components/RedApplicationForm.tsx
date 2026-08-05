import MultiStepApplicationForm, {
  StepConfig,
} from './grant-application/MultiStepApplicationForm'
import Prerequisites from './grant-application/steps/Prerequisites'
import ApplicantDetails from './grant-application/steps/ApplicantDetails'
import RedResearch from './grant-application/steps/RedResearch'
import TokenReimbursement from './grant-application/steps/TokenReimbursement'
import Review, { ReviewSection } from './grant-application/steps/Review'

const REVIEW_SECTIONS: ReviewSection[] = [
  {
    title: 'Applicant',
    fields: [
      ['Your Name', 'your_name'],
      ['Email', 'email'],
      ['Personal GitHub', 'personal_github'],
      ['Other Contact Details', 'other_contact'],
    ],
  },
  {
    title: 'Research',
    fields: [
      ['Short Title', 'project_name'],
      ['What Are You Researching?', 'short_description'],
      ['Disclosure Links', 'disclosure_links'],
    ],
  },
  {
    title: 'Budget',
    fields: [
      ['Token Spend So Far', 'token_spend_so_far'],
      ['Expected Ongoing Burn', 'estimated_token_burn'],
      ['Duration', 'duration'],
      ['Requested Reimbursement', 'proposed_budget'],
    ],
  },
]

const STEPS: StepConfig[] = [
  {
    id: 'prerequisites',
    title: 'Prerequisites',
    fields: [
      'red_security_research',
      'responsible_disclosure',
      'foss_outputs',
    ],
    render: (props) => <Prerequisites {...props} />,
  },
  {
    id: 'applicant',
    title: 'Applicant',
    fields: ['your_name', 'email'],
    render: (props) => <ApplicantDetails {...props} showLeadFields={false} />,
  },
  {
    id: 'research',
    title: 'Research',
    fields: ['project_name', 'short_description'],
    render: (props) => <RedResearch {...props} />,
  },
  {
    id: 'budget',
    title: 'Budget',
    fields: ['duration', 'estimated_token_burn', 'proposed_budget'],
    render: (props) => <TokenReimbursement {...props} />,
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

export default function RedApplicationForm() {
  return (
    <MultiStepApplicationForm
      steps={STEPS}
      hiddenFields={{ RED: true }}
      defaultValues={{ duration: '3 months' }}
      submitLabel="Submit Red Application"
    />
  )
}
