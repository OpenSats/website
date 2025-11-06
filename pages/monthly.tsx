import { GetServerSideProps } from 'next'
import { MONTHLY_DONATION_URL } from '@/utils/constants'

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: MONTHLY_DONATION_URL,
      permanent: false,
    },
  }
}

export default function Monthly() {
  // This component will never render due to the redirect above
  return null
}
