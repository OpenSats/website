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
  PotentialImpact,
  ProjectDescription,
  ProjectFocus,
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

export default function LTSApplicationForm(props: Props) {
  const { handleSubmit, onSubmit, register, loading, failureReason, isFLOSS } =
    props

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex max-w-2xl flex-col gap-4"
    >
      <input
        type="hidden"
        {...register('project_name', { value: 'Long-term Grant' })}
      />
      <input
        type="hidden"
        {...register('timelines', { value: 'Ongoing work.' })}
      />
      <input type="hidden" {...register('LTS', { value: true })} />

      <hr />
      <h2>Who Are You?</h2>
      <ApplicantName register={register} />

      <ApplicantEmail register={register} />

      <Question
        register={register}
        text="Personal Website, GitHub profile, or other Social Media"
        registerLabel="personal_github"
      />

      <TextBoxQuestion
        register={register}
        text="Prior Contributions"
        smallText="Describe the contributions you've made to Bitcoin Core or other
        Bitcoin-related open-source projects."
        registerLabel="bios"
        isRequired={true}
      />

      <h2>What Will You Work On?</h2>
      <ProjectDescription
        register={register}
        smallText="What do you intend to work on? Please be as specific as possible."
      />

      <PotentialImpact register={register} />

      <TextBoxQuestion
        register={register}
        text="Budget Expectations"
        smallText="Submit a proposed budget around how much funding you are requesting
        and how it will be used."
        registerLabel="proposed_budget"
        isRequired={true}
      />

      <h2>Anything Else We Should Know?</h2>
      <TextBoxQuestion
        register={register}
        text="Feel free to share whatever else might be important."
        registerLabel="anything_else"
      />

      <CheckboxQuestion
        register={register}
        text="I plan to receive or am receiving funding outside of OpenSats."
        registerLabel="has_received_funding"
      />

      <TextBoxQuestion
        register={register}
        text="If you receive or plan to receive any other funding, please describe
        it here:"
        registerLabel="what_funding"
      />

      <h2>Final Questions</h2>
      <ProjectFocus
        register={register}
        text="In which area will your project have the most impact?"
      />

      <References register={register} />

      <CheckboxQuestion
        register={register}
        text="Will your contributions be free and open-source?"
        registerLabel="free_open_source"
        isRequired={true}
      />

      <Footer />

      <FormButton
        variant={isFLOSS ? 'enabled' : 'disabled'}
        type="submit"
        disabled={loading}
      >
        Submit LTS Application
      </FormButton>

      {!!failureReason && (
        <p className="rounded bg-red-500 p-4 text-white">
          Something went wrong! {failureReason}
        </p>
      )}
    </form>
  )
}
