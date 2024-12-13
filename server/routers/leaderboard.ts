import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import { fundSlugs } from '../../utils/funds'
import { keycloak, prisma } from '../services'
import { authenticateKeycloakClient } from '../utils/keycloak'

export const leaderboardRouter = router({
  getLeaderboard: publicProcedure
    .input(
      z.object({
        fundSlug: z.enum(fundSlugs),
        projectSlug: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const leaderboardLimit = 10

      const withUserDonationSums = await prisma.donation.groupBy({
        by: ['userId', 'showDonorNameOnLeaderboard', 'donorName'],
        where: { userId: { not: null } },
        _sum: { grossFiatAmount: true },
        orderBy: { _sum: { grossFiatAmount: 'desc' } },
        take: leaderboardLimit,
      })

      const noUserDonations = await prisma.donation.findMany({
        where: { userId: null },
        orderBy: { grossFiatAmount: 'desc' },
        take: leaderboardLimit,
      })

      type LeaderboardItem = {
        name: string
        amount: number
      }

      let leaderboard: LeaderboardItem[] = []

      withUserDonationSums.forEach((donationSum) => {
        leaderboard.push({
          name: donationSum.showDonorNameOnLeaderboard
            ? donationSum.donorName || 'Anonymous'
            : 'Anonymous',
          amount: donationSum._sum.grossFiatAmount || 0,
        })
      })

      noUserDonations.forEach((donation) => {
        leaderboard.push({
          name: donation.showDonorNameOnLeaderboard
            ? donation.donorName || 'Anonymous'
            : 'Anonymous',
          amount: donation.grossFiatAmount || 0,
        })
      })

      leaderboard = leaderboard.toSorted((a, b) => b.amount - a.amount).slice(0, 20)

      return leaderboard
    }),
})
