import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import jwt from 'jsonwebtoken'

import { protectedProcedure, publicProcedure, router } from '../trpc'
import { authenticateKeycloakClient } from '../utils/keycloak'
import { keycloak, transporter } from '../services'
import { env } from '../../env.mjs'
import { fundSlugs } from '../../utils/funds'
import { UserSettingsJwtPayload } from '../types'

export const authRouter = router({
  register: publicProcedure
    .input(
      z
        .object({
          firstName: z
            .string()
            .trim()
            .min(1)
            .regex(/^[A-Za-záéíóúÁÉÍÓÚñÑçÇ]+$/, 'Use alphabetic characters only.'),
          lastName: z
            .string()
            .trim()
            .min(1)
            .regex(/^[A-Za-záéíóúÁÉÍÓÚñÑçÇ]+$/, 'Use alphabetic characters only.'),
          company: z.string(),
          email: z.string().email(),
          password: z.string().min(8),
          confirmPassword: z.string().min(8),
          fundSlug: z.enum(fundSlugs),
          _addMailingAddress: z.boolean(),
          address: z
            .object({
              addressLine1: z.string(),
              addressLine2: z.string(),
              city: z.string(),
              state: z.string(),
              country: z.string(),
              zip: z.string(),
              _addressStateOptionsLength: z.number(),
            })
            .superRefine((data, ctx) => {
              if (!data.state && data._addressStateOptionsLength) {
                ctx.addIssue({
                  path: ['shippingState'],
                  code: 'custom',
                  message: 'State is required.',
                })
              }
            }),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: 'Passwords do not match.',
          path: ['confirmPassword'],
        })
        .superRefine((data, ctx) => {
          if (data._addMailingAddress) {
            if (!data.address.addressLine1) {
              ctx.addIssue({
                path: ['shipping.addressLine1'],
                code: 'custom',
                message: 'Address line 1 is required.',
              })
            }

            if (!data.address.country) {
              ctx.addIssue({
                path: ['shipping.country'],
                code: 'custom',
                message: 'Country is required.',
              })
            }

            if (!data.address.city) {
              ctx.addIssue({
                path: ['shipping.city'],
                code: 'custom',
                message: 'City is required.',
              })
            }

            if (!data.address.zip) {
              ctx.addIssue({
                path: ['shipping.zip'],
                code: 'custom',
                message: 'Postal code is required.',
              })
            }
          }
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
          attributes: {
            name: `${input.firstName} ${input.lastName}`,
            passwordResetTokenVersion: 1,
            emailVerifyTokenVersion: 1,
            company: input.company,
            addressLine1: input._addMailingAddress ? input.address.addressLine1 : '',
            addressLine2: input._addMailingAddress ? input.address.addressLine2 : '',
            addressCountry: input._addMailingAddress ? input.address.country : '',
            addressState: input._addMailingAddress ? input.address.state : '',
            addressCity: input._addMailingAddress ? input.address.city : '',
            addressZip: input._addMailingAddress ? input.address.zip : '',
          },
          enabled: true,
        })
      } catch (error) {
        if ((error as any).responseData.errorMessage === 'User exists with same email') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'EMAIL_TAKEN' })
        }

        throw error
      }

      const payload: UserSettingsJwtPayload = {
        action: 'email_verify',
        tokenVersion: 1,
        userId: user.id,
        email: input.email,
      }

      const emailVerifyToken = jwt.sign(payload, env.USER_SETTINGS_JWT_SECRET, { expiresIn: '1d' })

      // no await here as we don't want to block the response
      transporter.sendMail({
        from: env.SES_VERIFIED_SENDER,
        to: input.email,
        subject: 'Verify your email',
        html: `<a href="${env.APP_URL}/${input.fundSlug}/verify-email/${emailVerifyToken}" target="_blank">Verify email</a>`,
      })
    }),

  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      let decoded: UserSettingsJwtPayload

      try {
        decoded = jwt.verify(input.token, env.USER_SETTINGS_JWT_SECRET) as UserSettingsJwtPayload
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

      const user = await keycloak.users.findOne({ id: decoded.userId })

      if (!user || !user.id)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'USER_NOT_FOUND',
        })

      const emailVerifyTokenVersion =
        parseInt(user.attributes?.emailVerifyTokenVersion?.[0]) || null

      if (emailVerifyTokenVersion !== decoded.tokenVersion) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'INVALID_TOKEN_VERSION',
        })
      }

      await keycloak.users.update(
        { id: decoded.userId },
        {
          ...user,
          email: decoded.email,
          emailVerified: true,
          requiredActions: [],
          attributes: {
            ...user.attributes,
            emailVerifyTokenVersion: (emailVerifyTokenVersion + 1).toString(),
          },
        }
      )

      await keycloak.users.logout({ id: decoded.userId })

      return { email: decoded.email }
    }),

  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      await authenticateKeycloakClient()
      const users = await keycloak.users.find({ email: input.email })
      const user = users[0]

      if (!user || !user.id)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'USER_NOT_FOUND',
        })

      let passwordResetTokenVersion =
        parseInt(user.attributes?.passwordResetTokenVersion?.[0]) || null

      if (!passwordResetTokenVersion) {
        await keycloak.users.update(
          { id: user.id },
          {
            ...user,
            email: input.email,
            attributes: { ...user.attributes, passwordResetTokenVersion: 1 },
          }
        )

        passwordResetTokenVersion = 1
      }

      const payload: UserSettingsJwtPayload = {
        action: 'password-reset',
        userId: user.id,
        email: input.email,
        tokenVersion: passwordResetTokenVersion,
      }

      const passwordResetToken = jwt.sign(payload, env.USER_SETTINGS_JWT_SECRET, {
        expiresIn: '30m',
      })

      // no await here as we don't want to block the response
      transporter.sendMail({
        from: env.SES_VERIFIED_SENDER,
        to: input.email,
        subject: 'Reset your password',
        html: `<a href="${env.APP_URL}/reset-password/${passwordResetToken}" target="_blank">Reset password</a>`,
      })
    }),

  resetPassword: publicProcedure
    .input(z.object({ token: z.string(), password: z.string().min(8) }))
    .mutation(async ({ input }) => {
      let decoded: UserSettingsJwtPayload

      try {
        decoded = jwt.verify(input.token, env.USER_SETTINGS_JWT_SECRET) as UserSettingsJwtPayload
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

      if (!user || !user.id || !user.email)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'USER_NOT_FOUND',
        })

      let passwordResetTokenVersion =
        parseInt(user.attributes?.passwordResetTokenVersion?.[0]) || null

      if (!passwordResetTokenVersion) {
        await keycloak.users.update(
          { id: user.id },
          { ...user, attributes: { ...user.attributes, passwordResetTokenVersion: 1 } }
        )

        passwordResetTokenVersion = 1
      }

      if (decoded.tokenVersion !== passwordResetTokenVersion)
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'INVALID_TOKEN',
        })

      await keycloak.users.update(
        { id: decoded.userId },
        {
          ...user,
          email: decoded.email,
          credentials: [{ type: 'password', value: input.password, temporary: false }],
          attributes: {
            ...user.attributes,
            passwordResetTokenVersion: (passwordResetTokenVersion + 1).toString(),
          },
        }
      )

      await keycloak.users.logout({ id: decoded.userId })

      return { email: decoded.email }
    }),
})
