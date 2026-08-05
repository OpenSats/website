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
      ['Main Focus', 'main_focus'],
      ['Short Title', 'project_name'],
      ['What Are You Researching?', 'short_description'],
      ['Potential Impact', 'potential_impact'],
      ['Disclosure Links', 'disclosure_links'],
    ],
  },
  {
    title: 'Token Reimbursement',
    fields: [
      ['Token Spend So Far', 'token_spend_so_far'],
      ['Expected Ongoing Burn', 'estimated_token_burn'],
      ['Requested Reimbursement', 'proposed_budget'],
    ],
  },
]

const STEPS: StepConfig[] = [
  {
    id: 'prerequisites',
    title: 'Prerequisites',
    fields: ['red_security_research', 'responsible_disclosure'],
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
    fields: [
      'main_focus',
      'project_name',
      'short_description',
      'potential_impact',
    ],
    render: (props) => <RedResearch {...props} />,
  },
  {
    id: 'tokens',
    title: 'Token Reimbursement',
    fields: [
      'token_spend_so_far',
      'estimated_token_burn',
      'proposed_budget',
    ],
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
      submitLabel="Submit Red Application"
    />
  )
}
