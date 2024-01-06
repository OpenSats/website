import FormButton from '@/components/FormButton'
import {
  UseFormHandleSubmit,
  UseFormRegister,
  FieldErrors,
  FieldValues,
  SubmitHandler,
} from 'react-hook-form'
import {
  ApplicantEmail,
  ApplicantName,
  CheckboxQuestion,
  Footer,
  OtherContactDetails,
  PotentialImpact,
  ProjectDescription,
  ProjectFocus,
  ProjectName,
  Question,
  References,
  TextBoxQuestion,
} from '@/components/FormElements'

interface Props {
  handleSubmit: UseFormHandleSubmit<FieldValues>
  onSubmit: SubmitHandler<FieldValues>
  register: UseFormRegister<FieldValues>
  errors: FieldErrors<FieldValues>
  loading: boolean
  failureReason: string
  isFLOSS: boolean
}

export default function GrantApplicationForm(props: Props) {
  const {
    handleSubmit,
    onSubmit,
    register,
    errors,
    loading,
    failureReason,
    isFLOSS,
  } = props

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="apply flex max-w-2xl flex-col gap-4"
    >
      <input type="hidden" {...register('general_fund', { value: true })} />

      <hr />
      <h2>Project Details</h2>
      <ProjectFocus
        register={register}
        text="Main Focus"
        smallText="In which area will your project have the most impact?"
      />

      <ProjectName
        register={register}
        smallText="The name of the project. Abbreviations are fine too."
      />

      <ProjectDescription
        register={register}
        smallText="A great description will help us to evaluate your project more quickly."
      />

      <PotentialImpact register={register} />

      <TextBoxQuestion
        register={register}
        text="Project Timelines and Potential Milestones"
        smallText="This will help us evaluate overall scope and potential grant duration."
        registerLabel="timelines"
        isRequired={true}
      />

      <Question
        register={register}
        text="Project Github (or similar, if applicable)"
        registerLabel="github"
      />

      <CheckboxQuestion
        register={register}
        text="Is the project free and open-source?"
        registerLabel="free_open_source"
        isRequired={true}
      />

      <hr />
      <h2>Project Budget</h2>
      <TextBoxQuestion
        register={register}
        text="Costs & Proposed Budget"
        smallText="Current or estimated costs of the project. If you're applying for a grant 
        from the general fund, please submit a proposed budget around how much funding you are 
        requesting and how it will be used."
        registerLabel="proposed_budget"
        isRequired={true}
      />

      <CheckboxQuestion
        register={register}
        text="Has this project received any prior funding?"
        registerLabel="has_received_funding"
        isRequired={false}
      />

      <Question
        register={register}
        text="If so, please describe."
        registerLabel="what_funding"
      />

      <hr />
      <h2>Applicant Details</h2>
      <ApplicantName register={register} />

      <ApplicantEmail register={register} errors={errors} />

      <CheckboxQuestion
        register={register}
        text="Are you the Project Lead / Lead Contributor?"
        registerLabel="are_you_lead"
        isRequired={false}
      />

      <Question
        register={register}
        text="If someone else, please list the project's Lead Contributor or Maintainer"
        registerLabel="other_lead"
      />

      <Question
        register={register}
        text="Personal Github (or similar, if applicable)"
        registerLabel="personal_github"
      />

      <OtherContactDetails register={register} />

      <TextBoxQuestion
        register={register}
        text="Prior Contributions"
        smallText="Please list any prior contributions to other open-source or 
        Bitcoin-related projects."
        registerLabel="bios"
      />

      <References register={register} />

      <Footer />

      <FormButton
        variant={isFLOSS ? 'enabled' : 'disabled'}
        type="submit"
        disabled={loading}
      >
        Submit Grant Application
      </FormButton>

      {!!failureReason && (
        <p className="rounded bg-red-500 p-4 text-white">
          Something went wrong! {failureReason}
        </p>
      )}
    </form>
  )
}
