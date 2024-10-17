import { router } from '../trpc'
import { accountRouter } from './account'
import { applicationRouter } from './application'
import { authRouter } from './auth'
import { donationRouter } from './donation'

export const appRouter = router({
  auth: authRouter,
  donation: donationRouter,
  application: applicationRouter,
  account: accountRouter,
})

export type AppRouter = typeof appRouter
