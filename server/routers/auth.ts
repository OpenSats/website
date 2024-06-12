import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import jwt from 'jsonwebtoken'

import { publicProcedure, router } from '../trpc'
import { authenticateKeycloakClient } from '../utils/keycloak'
import { keycloak, sendgrid, transporter } from '../services'
import { env } from '../../env.mjs'

export const authRouter = router({
  register: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input }) => {
      await authenticateKeycloakClient()

      try {
        const user = await keycloak.users.create({
          realm: 'monerofund',
          email: input.email,
          credentials: [
            { type: 'password', value: input.password, temporary: false },
          ],
          requiredActions: ['VERIFY_EMAIL'],
          enabled: true,
        })

        // Send verification email with Sendgrid
        const token = jwt.sign(
          { userId: user.id, email: input.email },
          env.NEXTAUTH_SECRET,
          { expiresIn: '1d' }
        )

        // no await here as we don't want to block the response
        transporter.sendMail({
          from: env.SENDGRID_VERIFIED_SENDER,
          to: input.email,
          subject: 'Verify your email',
          html: `<a href="${env.APP_URL}/verify-email/${token}" target="_blank">Verify email</a>`,
        })
      } catch (error) {
        if (
          (error as any).responseData.errorMessage ===
          'User exists with same email'
        ) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'EMAIL_TAKEN' })
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'UNKNOWN_ERROR',
        })
      }
    }),

  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const decoded = jwt.verify(input.token, env.NEXTAUTH_SECRET) as {
          userId: string
          email: string
        }

        await authenticateKeycloakClient()

        await keycloak.users.update(
          { id: decoded.userId },
          { emailVerified: true, requiredActions: [] }
        )

        return { email: decoded.email }
      } catch (error) {
        console.error(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'UNKNOWN_ERROR',
        })
      }
    }),

  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      try {
        await authenticateKeycloakClient()

        const users = await keycloak.users.find({ email: input.email })
        const userId = users[0]?.id

        if (!userId) return

        await keycloak.users.executeActionsEmail({
          id: userId,
          actions: ['UPDATE_PASSWORD'],
        })
      } catch (error) {
        console.error(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'UNKNOWN_ERROR',
        })
      }
    }),
})
