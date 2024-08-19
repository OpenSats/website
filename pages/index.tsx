import { redirect } from 'next/navigation'

function Root() {
  return <></>
}

export default Root

export function getServerSideProps() {
  return {
    redirect: {
      destination: '/general',
      permanent: true,
    },
  }
}
