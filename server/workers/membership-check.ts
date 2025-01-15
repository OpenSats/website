import { Worker } from 'bullmq'
import { redisConnection as connection } from '../../config/redis'
import { prisma, privacyGuidesDiscourseApi } from '../services'
import { env } from '../../env.mjs'

const globalForWorker = global as unknown as { hasInitializedWorkers: boolean }

if (!globalForWorker.hasInitializedWorkers)
  new Worker(
    'MembershipCheck',
    async (job) => {
      // Checks for expired PG memberships, and remove forum group members when applicable
      const pgAccountConnections = await prisma.accountConnection.findMany({
        where: { privacyGuidesAccountIsInMemberGroup: true },
      })

      const userIds = pgAccountConnections.map((connection) => connection.userId)

      const usersActiveMembershipDonations = await prisma.donation.groupBy({
        by: ['userId'],
        where: {
          userId: { in: userIds },
          fundSlug: 'privacyguides',
          membershipExpiresAt: { gt: new Date() },
        },
      })

      const userIdsWithActiveMembership = new Set(
        usersActiveMembershipDonations.map((donation) => donation.userId)
      )

      const userIdsWithExpiredMembership: string[] = userIds.filter(
        (userId) => !userIdsWithActiveMembership.has(userId)
      )

      const discrouseGroupMembersToRemove = pgAccountConnections
        .filter((connection) => userIdsWithExpiredMembership.includes(connection.userId))
        .map((connection) => connection.externalId)

      await privacyGuidesDiscourseApi.delete(
        `/groups/${env.PRIVACYGUIDES_DISCOURSE_MEMBERSHIP_GROUP_ID}/members.json`,
        {
          data: { usernames: discrouseGroupMembersToRemove.join(',') },
        }
      )

      await prisma.accountConnection.updateMany({
        where: {
          externalId: { in: discrouseGroupMembersToRemove },
          privacyGuidesAccountIsInMemberGroup: true,
        },
        data: {
          privacyGuidesAccountIsInMemberGroup: false,
        },
      })
    },
    { connection }
  )

if (process.env.NODE_ENV !== 'production') globalForWorker.hasInitializedWorkers = true
