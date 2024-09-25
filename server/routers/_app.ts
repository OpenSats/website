import { router } from '../trpc'
import { applicationRouter } from './application'
import { authRouter } from './auth'
import { donationRouter } from './donation'
import { perkRouter } from './perk'

export const appRouter = router({
  auth: authRouter,
  donation: donationRouter,
  application: applicationRouter,
  perk: perkRouter,
})

export type AppRouter = typeof appRouter
