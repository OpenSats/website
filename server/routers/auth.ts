import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import jwt from 'jsonwebtoken'

import { publicProcedure, router } from '../trpc'
import { authenticateKeycloakClient } from '../utils/keycloak'
import { keycloak, transporter } from '../services'
import { env } from '../../env.mjs'
import { fundSlugs } from '../../utils/funds'

type EmailVerifyJwtPayload = {
  action: 'email_verify'
  userId: string
  email: string
}

type PasswordResetJwtPayload = {
  action: 'password-reset'
  userId: string
  email: string
  tokenVersion: number
}

export const authRouter = router({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().trim().min(1),
        email: z.string().email(),
        password: z.string(),
        fundSlug: z.enum(fundSlugs),
      })
    )
    .mutation(async ({ input }) => {
      await authenticateKeycloakClient()

      let user: { id: string }

      try {
        user = await keycloak.users.create({
          realm: env.KEYCLOAK_REALM_NAME,
          email: input.email,
          credentials: [{ type: 'password', value: input.password, temporary: false }],
          requiredActions: ['VERIFY_EMAIL'],
          attributes: { name: input.name, passwordResetTokenVersion: 1 },
          enabled: true,
        })
      } catch (error) {
        if ((error as any).responseData.errorMessage === 'User exists with same email') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'EMAIL_TAKEN' })
        }

        throw error
      }

      const payload: EmailVerifyJwtPayload = {
        action: 'email_verify',
        userId: user.id,
        email: input.email,
      }

      const emailVerifyToken = jwt.sign(payload, env.NEXTAUTH_SECRET, {
        expiresIn: '1d',
      })

      // no await here as we don't want to block the response
      transporter.sendMail({
        from: env.SENDGRID_VERIFIED_SENDER,
        to: input.email,
        subject: 'Verify your email',
        html: `<a href="${env.APP_URL}/${input.fundSlug}/verify-email/${emailVerifyToken}" target="_blank">Verify email</a>`,
      })
    }),

  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      let decoded: EmailVerifyJwtPayload

      try {
        decoded = jwt.verify(input.token, env.NEXTAUTH_SECRET) as EmailVerifyJwtPayload
      } catch (error) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'INVALID_TOKEN',
        })
      }

      if (decoded.action !== 'email_verify') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'INVALID_ACTION',
        })
      }

      await authenticateKeycloakClient()

      await keycloak.users.update(
        { id: decoded.userId },
        { emailVerified: true, requiredActions: [] }
      )

      return { email: decoded.email }
    }),

  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      await authenticateKeycloakClient()
      const users = await keycloak.users.find({ email: input.email })
      const user = users[0]

      if (!user || !user.id || !user.attributes)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'USER_NOT_FOUND',
        })

      const passwordResetTokenVersion =
        parseInt(user.attributes.passwordResetTokenVersion?.[0]) || null

      if (!passwordResetTokenVersion) {
        console.error(`User ${user.id} has no passwordResetTokenVersion attribute`)

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
        })
      }

      const payload: PasswordResetJwtPayload = {
        action: 'password-reset',
        userId: user.id,
        email: input.email,
        tokenVersion: passwordResetTokenVersion,
      }

      const passwordResetToken = jwt.sign(payload, env.NEXTAUTH_SECRET, {
        expiresIn: '30m',
      })

      // no await here as we don't want to block the response
      transporter.sendMail({
        from: env.SENDGRID_VERIFIED_SENDER,
        to: input.email,
        subject: 'Reset your password',
        html: `<a href="${env.APP_URL}/reset-password/${passwordResetToken}" target="_blank">Reset password</a>`,
      })
    }),

  resetPassword: publicProcedure
    .input(z.object({ token: z.string(), password: z.string().min(8) }))
    .mutation(async ({ input }) => {
      let decoded: PasswordResetJwtPayload

      try {
        decoded = jwt.verify(input.token, env.NEXTAUTH_SECRET) as PasswordResetJwtPayload
      } catch (error) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'INVALID_TOKEN',
        })
      }

      if (decoded.action !== 'password-reset') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'INVALID_ACTION',
        })
      }

      await authenticateKeycloakClient()
      const user = await keycloak.users.findOne({ id: decoded.userId })

      if (!user || !user.attributes)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'USER_NOT_FOUND',
        })

      const passwordResetTokenVersion =
        parseInt(user.attributes.passwordResetTokenVersion?.[0]) || null

      if (!passwordResetTokenVersion) {
        console.error(`User ${user.id} has no passwordResetTokenVersion attribute`)

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
        })
      }

      if (decoded.tokenVersion !== passwordResetTokenVersion)
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'INVALID_TOKEN',
        })

      await keycloak.users.update(
        { id: decoded.userId },
        {
          email: decoded.email,
          credentials: [{ type: 'password', value: input.password, temporary: false }],
          attributes: {
            passwordResetTokenVersion: (passwordResetTokenVersion + 1).toString(),
          },
        }
      )

      return { email: decoded.email }
    }),
})
