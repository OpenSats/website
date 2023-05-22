import { useRouter } from "next/router"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { fetchPostJSON } from "../utils/api-helpers"
import Button from "@/components/Button"

export default function ApplicationForm() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const {
        register,
        watch,
        handleSubmit,
        formState: { errors },
    } = useForm()

    const isFLOSS = watch("free_open_source", false);
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
            <h2>Who Are You?</h2>
            <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <label className="block">
                Your Name *<br/>
                <small>
                    Feel free to use your nym.
                </small>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50" placeholder="John Doe" {...register('your_name', { required: true })} />
            </label>
            <label className="block">
                Email *
                <input type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50" placeholder="satoshi.nakamoto@bitcoin.org" {...register('email', { required: true })} />
            </label>
            <label className="block">
                Personal Website, GitHub profile, or other Social Media
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50" {...register('personal_github')} />
            </label>






            <hr/>






            <h2>What Will You Work On?</h2>
            <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <label className="block">
                Prior Contributions *<br/>
                <small>
                    Describe the contributions you've made to Bitcoin Core or
                    other Bitcoin-related open-source projects.
                </small>
                <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50" {...register('bios', { required: true })} />
            </label>
            
            <label className="block">
                Project Description *<br/>
                <small>
                    What do you intend to work on? Please be as specific as possible.
                </small>
                <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50" {...register('short_description', { required: true })} />
            </label>

            <label className="block">
                Potential Impact *<br/>
                <small>
                    Why is this project important to Bitcoin or the broader free and
                    open-source community?
                </small>
                <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50" {...register('potential_impact', { required: true })} />
            </label>

            <label className="block">
                Project Timeline and Milestones *<br/>
                <small>
                    This will help us evaluate overall scope and potential grant duration.
                </small>
                <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50" {...register('timelines', { required: true })} />
            </label>

            <label className="block">
                Budget Expectations *<br/>
                <small>
                    Submit a proposed budget around how much funding you are requesting
                    and how it will be used.
                </small>
                <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50" {...register('proposed_budget', { required: true })} />
            </label>

            <label className="block">
                References *<br/>
                <small>
                    Please list any references from the Bitcoin community or open-source
                    space that we could contact for more information on you or your project.
                </small>
                <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50" {...register('references', { required: true })} />
            </label>

            <label className="block">
                Focus Area<br/>
                <small>
                    In which area will your work have the most impact?
                </small>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50" {...register('main_focus')} >
                    <option value="bitcoin">Bitcoin</option>
                    <option value="lightning">Lightning</option>
                    <option value="nostr">nostr</option>
                    <option value="other">Other</option>
                </select>
            </label>

            <label className="inline-flex items-center">
                <input type="checkbox" className="rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50" {...register('free_open_source')} />
                <span className="ml-2">Will your contributions be free and open-source? *</span>
            </label>

            <hr/>

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

            <Button variant={ isFLOSS ? 'enabled' : 'disabled' } type="submit" disabled={ loading }>
                Send Application
            </Button>

            {!!failureReason && <p className="rounded bg-red-500 p-4 text-white">Something went wrong! {failureReason}</p>}

        </form >
    )
}