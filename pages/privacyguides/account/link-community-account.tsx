import { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'
import crypto from 'crypto'

import { env } from '../../../env.mjs'
import { authenticateKeycloakClient } from '../../../server/utils/keycloak'
import { authOptions } from '../../api/auth/[...nextauth]'
import { keycloak, prisma, privacyGuidesDiscourseApi } from '../../../server/services'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { toast } from '../../../components/ui/use-toast'

export async function getServerSideProps({ query, req, res }: GetServerSidePropsContext) {
  const { sso, sig } = query

  if (!sso || !sig) {
    return { props: { success: false } }
  }

  const expectedSig = crypto
    .createHmac('sha256', env.PRIVACYGUIDES_DISCOURSE_CONNECT_SECRET)
    .update(sso as string)
    .digest('hex')

  // Check if incoming signature is valid
  if (expectedSig !== sig) {
    return { props: { success: false } }
  }

  await authenticateKeycloakClient()
  const session = await getServerSession(req, res, authOptions)
  const userId = session?.user.sub || ''
  const user = await keycloak.users.findOne({ id: userId })

  if (!user || !user.id) {
    return { props: { success: false } }
  }

  const expectedNonce = user.attributes?.privacyGuidesDiscourseLinkNonce?.[0] as string | undefined

  if (!expectedNonce) {
    return { props: { success: false } }
  }

  // Decode base64 SSO payload
  const ssoPayloadStr = atob(sso as string)
  const ssoPayload = new URLSearchParams(ssoPayloadStr)
  const nonce = ssoPayload.get('nonce')!
  const discourseUsername = ssoPayload.get('username')!

  // Check if nonce is valid
  if (expectedNonce !== nonce) {
    return { props: { success: false } }
  }

  // Check if username is in use
  const accountConnectionWithUsername = await prisma.accountConnection.findFirst({
    where: { type: 'privacyGuidesForum', externalId: discourseUsername },
  })

  if (accountConnectionWithUsername) {
    return { props: { success: false } }
  }

  // Check if user has an active PG membership
  const membership = await prisma.donation.findFirst({
    where: { userId, fundSlug: 'privacyguides', membershipExpiresAt: { gt: new Date() } },
  })

  // Add PG forum user to membership group
  if (membership) {
    await privacyGuidesDiscourseApi.put(
      `/groups/${env.PRIVACYGUIDES_DISCOURSE_MEMBERSHIP_GROUP_ID}/members.json`,
      { usernames: discourseUsername }
    )
  }

  await prisma.accountConnection.create({
    data: {
      type: 'privacyGuidesForum',
      userId,
      externalId: discourseUsername,
      privacyGuidesAccountIsInMemberGroup: !!membership,
    },
  })

  await keycloak.users.update(
    { id: userId },
    {
      ...user,
      attributes: {
        ...user.attributes,
        privacyGuidesDiscourseLinkNonce: null,
      },
    }
  )

  return { props: { success: true } }
}

type Props = { success: boolean }

function LinkCommunityAccount({ success }: Props) {
  const router = useRouter()

  useEffect(() => {
    if (success) {
      toast({ title: 'Success', description: 'Account successfully linked!' })
    }

    if (!success) {
      toast({ title: 'Error', description: 'Something went wrong.', variant: 'destructive' })
    }

    router.push('/privacyguides')
  }, [])

  return <div />
}

export default LinkCommunityAccount
