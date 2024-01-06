import { useRouter } from 'next/router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { fetchPostJSON } from '../utils/api-helpers'
import LTSApplicationForm from '@/components/LTSApplicationForm'
import GrantApplicationForm from '@/components/GrantApplicationForm'
import WebsiteApplicationForm from '@/components/WebsiteApplicationForm'

interface Props {
  form: string
}

export default function ApplicationForm({ form }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const isFLOSS = watch('free_open_source', false)
  const [failureReason, setFailureReason] = useState<string>()

  const onSubmit = async (data) => {
    setLoading(true)
    console.log(data)

    try {
      // Track application in GitHub
      const res = await fetchPostJSON('/api/github', data)
      if (res.message === 'success') {
        console.info('Application tracked') // Succeed silently
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

  switch (form) {
    case 'Grant':
      return (
        <GrantApplicationForm
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          register={register}
          errors={errors}
          isFLOSS={isFLOSS}
          loading={loading}
          failureReason={failureReason}
        />
      )
    case 'LTS':
      return (
        <LTSApplicationForm
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          register={register}
          errors={errors}
          isFLOSS={isFLOSS}
          loading={loading}
          failureReason={failureReason}
        />
      )
    case 'Website':
      return (
        <WebsiteApplicationForm
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          register={register}
          errors={errors}
          isFLOSS={isFLOSS}
          loading={loading}
          failureReason={failureReason}
        />
      )
  }
}
