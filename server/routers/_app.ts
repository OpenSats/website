import { router } from '../trpc'
import { applicationRouter } from './application'
import { authRouter } from './auth'
import { donationRouter } from './donation'

export const appRouter = router({
  auth: authRouter,
  donation: donationRouter,
  application: applicationRouter,
})

export type AppRouter = typeof appRouter
