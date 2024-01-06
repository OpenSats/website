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
  OtherContactDetails,
  PotentialImpact,
  ProjectDescription,
  ProjectFocus,
  ProjectName,
  Question,
  References,
  TextBoxQuestion,
  WebsiteApplicationFooter,
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

export default function WebsiteApplicationForm(props: Props) {
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
      className="flex max-w-2xl flex-col gap-4 p-4"
    >
      <input type="hidden" {...register('explore_page', { value: true })} />

      <hr />
      <h2>Project Details</h2>
      <ProjectFocus
        register={register}
        text="Main Focus"
        smallText="In which area will your project have the most impact?"
      />

      <ProjectName
        register={register}
        smallText="The name of the project to be listed on the OpenSats website"
      />

      <ProjectDescription
        register={register}
        smallText="This will be listed on the explore projects page of the OpenSats
        website. Please write at least 2-3 sentences."
        isRequired={true}
      />

      <PotentialImpact register={register} />

      <hr />
      <h2>Project Links</h2>
      <Question
        register={register}
        text="Project Repository"
        smallText="GitHub, GitLab, Bitbucket, Gitea, or similar"
        registerLabel="github"
        isRequired={true}
      />

      <TextBoxQuestion
        register={register}
        text="Project-specific Social Media"
        smallText="Please include any project-specific social media or common community
        communication platforms like Twitter, Telegram, nostr, Keybase, Discord, etc."
        registerLabel="social_media"
      />

      <TextBoxQuestion
        register={register}
        text="Additional Project Links"
        smallText="Other links that might be relevant, such as website, documentation,
        links to app stores, etc."
        registerLabel="relevant_links"
      />

      <CheckboxQuestion
        register={register}
        text="Is the project free and open-source?"
        registerLabel="free_open_source"
        isRequired={true}
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
        text="If someone else, please list the project's Lead Contributor or
        Maintainer"
        registerLabel="other_lead"
      />

      <hr />
      <h2>Applicant Links</h2>
      <Question
        register={register}
        text="Personal Github (or similar, if applicable)"
        registerLabel="personal_github"
      />

      <References register={register} />

      <OtherContactDetails register={register} />

      <WebsiteApplicationFooter />

      <FormButton
        variant={isFLOSS ? 'enabled' : 'disabled'}
        type="submit"
        disabled={loading}
      >
        Submit Listing Request
      </FormButton>

      {!!failureReason && (
        <p className="rounded bg-red-500 p-4 text-white">
          Something went wrong! {failureReason}
        </p>
      )}
    </form>
  )
}
