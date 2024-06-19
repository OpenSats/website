import { router } from '../trpc'
import { authRouter } from './auth'
import { donationRouter } from './donation'

export const appRouter = router({
  auth: authRouter,
  donation: donationRouter,
})

export type AppRouter = typeof appRouter
