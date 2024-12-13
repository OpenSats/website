import { router } from '../trpc'
import { applicationRouter } from './application'
import { authRouter } from './auth'
import { donationRouter } from './donation'
import { perkRouter } from './perk'
import { accountRouter } from './account'
import { leaderboardRouter } from './leaderboard'

export const appRouter = router({
  auth: authRouter,
  donation: donationRouter,
  application: applicationRouter,
  perk: perkRouter,
  account: accountRouter,
  leaderboard: leaderboardRouter,
})

export type AppRouter = typeof appRouter
