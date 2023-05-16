import { useRouter } from "next/router"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { fetchPostJSON } from "../utils/api-helpers"

export default function ApplicationForm() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()

    const [failureReason, setFailureReason] = useState<string>();

    const onSubmit = async (data: any) => {
        setLoading(true)
        console.log(data)

        try {
            // Track application in GitHub
            const res = await fetchPostJSON('/api/github', data)
            if (res.message === 'success') {
                console.info("Application tracked") // Succeed silently
            } else {
                // Fail silently
            }
        } catch (e) {
            if (e instanceof Error) {
                // Fail silently
            }
        } finally {
            // Mail application to us
            try {
                const res = await fetchPostJSON('/api/sendgrid', data)
                if (res.message === 'success') {
                    router.push('/submitted')
                } else {
                    setFailureReason(res.message)
                }
            } catch (e) {
                if (e instanceof Error) {
                    setFailureReason(e.message)
                }
            } finally {
                setLoading(false)
            }
        }

    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="apply flex flex-col gap-4 p-4 max-w-2xl"
        >
            <label className="checkbox">
                <input type="checkbox" {...register('general_fund')} />
                Apply to receive a grant from the OpenSats General Fund
            </label>

            <label className="checkbox">
                <input type="checkbox" {...register('explore_page')} />
                Apply for my project to be listed on the OpenSats Explore Page
            </label>

            <hr/>
            <h2>Project Details</h2>

            <label className="block">
                Main Focus
                <small>
                    In which area will your project have the most impact?
                </small>
                <select {...register('main_focus')} >
                    <option value="bitcoin">Bitcoin</option>
                    <option value="lightning">Lightning</option>
                    <option value="nostr">nostr</option>
                    <option value="other">Other</option>
                </select>
            </label>
            
            <label className="block">
                Project Name *
                <small>
                    The name of the project to be listed on the OpenSats website
                </small>
                <input
                    type="text"
                    {...register('project_name', { required: true })}
                />
            </label>

            <label className="block">
                Project Description *
                <small>
                    This will be listed on the explore projects page of the OpenSats
                    website. Please write at least 2-3 sentences.
                </small>
                <textarea className="mt-1 block w-full" {...register('short_description', { required: true })} />
            </label>

            <label className="block">
                Potential Impact *
                <small>
                    Why is this project important to Bitcoin or the broader free and
                    open-source community?
                </small>
                <textarea className="mt-1 block w-full" {...register('potential_impact', { required: true })} />
            </label>
            {/* <label className="block">
                  Project Images: (attachment)
                  <input type="text" className="mt-1 block w-full" {...register('your_name', { required: true })} />
              </label> */}

            <label className="block">
                Project Timelines and Potential Milestones *
                <small>
                    This will help us evaluate overall scope and potential grant duration.
                </small>
                <textarea className="mt-1 block w-full" {...register('timelines', { required: true })} />
            </label>

            <label className="block">
                Project Github (or similar, if applicable)
                <input type="text" className="mt-1 block w-full" {...register('github')} />
            </label>

            <label className="checkbox">
                <input type="checkbox" {...register('free_open_source')} />
                Is the project free and open-source?
            </label>

            <hr/>

            <label className="block">
                Costs & Proposed Budget *
                <small>
                    Current or estimated costs of the project. 
                    If you&#39;re applying for a grant from the general fund, please
                    submit a proposed budget around how much funding you are requesting
                    and how it will be used.
                </small>
                <textarea className="mt-1 block w-full" {...register('proposed_budget', { required: true })} />
            </label>

            <label className="checkbox">
                <input type="checkbox" {...register('has_received_funding')} />
                Has this project received any prior funding?
            </label>

            <label className="block">
                If so, please describe.
                <input type="text" className="mt-1 block w-full" {...register('what_funding')} />
            </label>

            <label className="block">

                Additional Project Links
                <small>
                    Other links that might be relevant, such as website, documentation, links to app stores, etc.
                </small>
                <textarea className="mt-1 block w-full" {...register('relevant_links')} />
            </label>

            <label className="block">
                Project-specific Social Media
                <small>
                    Please include any project-specific social media or common community communication
                    platforms like Twitter, Telegram, nostr, Keybase, Discord, etc.
                </small>
                <textarea className="mt-1 block w-full" {...register('social_media')} />
            </label>

            <hr/>

            <h2>Applicant Details</h2>
            <label className="block">
                Your Name *
                <small>
                    Feel free to use your nym.
                </small>
                <input type="text" className="mt-1 block w-full" {...register('your_name', { required: true })} />
            </label>
            <label className="block">
                Email *
                <input type="text" className="mt-1 block w-full" {...register('email', { required: true })} />
            </label>
            <label className="checkbox">
                <input type="checkbox" {...register('are_you_lead')} />
                Are you the Project Lead / Lead Contributor?
            </label>
            <label className="block">
                If someone else, please list the project&#39;s Lead Contributor or
                Maintainer <input type="text" className="mt-1 block w-full" {...register('other_lead')} />
            </label>
            <label className="block">
                Personal Github (or similar, if applicable)
                <input type="text" className="mt-1 block w-full" {...register('personal_github')} />
            </label>
            <label className="block">
                Other Contact Details (if applicable)
                <small>
                    Please list any other relevant contact details you are comfortable
                    sharing in case we need to reach out with questions.
                    These could include nostr pubkeys, social media handles, emails, phone
                    numbers, etc.
                </small>
                <textarea className="mt-1 block w-full" {...register('other_contact')} />
            </label>
            <label className="block">
                Prior Contributions
                <small>
                    Please list any prior contributions to other open-source or
                    Bitcoin-related projects.
                </small>
                <textarea className="mt-1 block w-full" {...register('bios')} />
            </label>
            <label className="block">
                References *
                <small>
                    Please list any references from the Bitcoin community or open-source
                    space that we could contact for more information on you or your project.
                </small>
                <textarea className="mt-1 block w-full" {...register('references', { required: true })} />
            </label>
            <div className="prose">
                <small>
                    Open Sats may require each recipient to sign a Grant Agreement
                    before any funds are disbursed. Using the reports and presentations
                    required by the Grant Agreement, Open Sats will monitor and evaluate
                    the expenditure of funds on a quarterly basis. Any apparent misuse
                    of grant funds will be promptly investigated. If OpenSats discovers
                    that the funds have been misused, the recipient will be required to
                    return the funds immediately, and be barred from further
                    distributions. Open Sats will maintain the records required by
                    Revenue Ruling 56-304, 1956-2 C.B. 306 regarding distribution of
                    charitable funds to individuals.
                </small>
            </div>

            <button type="submit" disabled={loading}>
                Apply
            </button>

            {!!failureReason && <p className="rounded bg-red-500 p-4 text-white">Something went wrong! {failureReason}</p>}

        </form >
    )
}