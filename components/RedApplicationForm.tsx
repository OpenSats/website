import MultiStepApplicationForm, {
  StepConfig,
} from './grant-application/MultiStepApplicationForm'
import Prerequisites from './grant-application/steps/Prerequisites'
import ApplicantDetails from './grant-application/steps/ApplicantDetails'
import RedResearch from './grant-application/steps/RedResearch'
import TokenReimbursement from './grant-application/steps/TokenReimbursement'
import Review, { ReviewSection } from './grant-application/steps/Review'
import RedLegalAcknowledgments from './grant-application/steps/RedLegalAcknowledgments'
import {
  RED_ACK_FIELDS,
  RED_TERMS_EFFECTIVE,
} from './grant-application/redTerms'

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
      ['Prior Work', 'prior_work'],
    ],
  },
  {
    title: 'Token Reimbursement',
    fields: [
      ['LLM Token Spend So Far', 'token_spend_so_far'],
      ['Expected Ongoing Token Burn', 'estimated_token_burn'],
      ['Reimbursement Window', 'duration'],
    ],
  },
]

const STEPS: StepConfig[] = [
  {
    id: 'prerequisites',
    title: 'Prerequisites',
    fields: [
      'red_security_research',
      'red_track_record',
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
    fields: ['project_name', 'short_description', 'prior_work'],
    render: (props) => <RedResearch {...props} />,
  },
  {
    id: 'budget',
    title: 'Token Reimbursement',
    fields: ['token_spend_so_far', 'estimated_token_burn', 'duration'],
    render: (props) => <TokenReimbursement {...props} />,
  },
  {
    id: 'review',
    title: 'Review',
    fields: [...RED_ACK_FIELDS],
    render: (props) => (
      <>
        <Review watch={props.watch} sections={REVIEW_SECTIONS} />
        <RedLegalAcknowledgments {...props} />
      </>
    ),
  },
]

export default function RedApplicationForm() {
  return (
    <MultiStepApplicationForm
      steps={STEPS}
      hiddenFields={{
        RED: true,
        red_terms_effective: RED_TERMS_EFFECTIVE,
      }}
      defaultValues={{ duration: '1 month' }}
      submitLabel="Submit RED Reimbursement Application"
      submitRequiresChecked={RED_ACK_FIELDS}
    />
  )
}
