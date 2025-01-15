import { prisma, privacyGuidesDiscourseApi } from '../server/services'
import { env } from '../env.mjs'

export async function addUserToPgMembersGroup(userId: string) {
  const accountConnection = await prisma.accountConnection.findFirst({
    where: { type: 'privacyGuidesForum', userId },
  })

  if (!accountConnection) return

  if (!accountConnection?.privacyGuidesAccountIsInMemberGroup && accountConnection?.externalId) {
    await privacyGuidesDiscourseApi.put(
      `/groups/${env.PRIVACYGUIDES_DISCOURSE_MEMBERSHIP_GROUP_ID}/members.json`,
      { usernames: accountConnection.externalId }
    )

    await prisma.accountConnection.update({
      where: { id: accountConnection.id },
      data: { privacyGuidesAccountIsInMemberGroup: true },
    })
  }
}
