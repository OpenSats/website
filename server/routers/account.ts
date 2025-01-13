import { z } from 'zod'
import { jwtDecode } from 'jwt-decode'
import { TRPCError } from '@trpc/server'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

import { protectedProcedure, router } from '../trpc'
import { env } from '../../env.mjs'
import { KeycloakJwtPayload, UserSettingsJwtPayload } from '../types'
import { keycloak, prisma, privacyGuidesDiscourseApi, transporter } from '../services'
import { authenticateKeycloakClient } from '../utils/keycloak'
import { fundSlugs } from '../../utils/funds'

export const accountRouter = router({
  changeProfile: protectedProcedure
    .input(
      z.object({
        company: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await authenticateKeycloakClient()

      const userId = ctx.session.user.sub
      const user = await keycloak.users.findOne({ id: userId })

      if (!user || !user.id)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'USER_NOT_FOUND',
        })

      await keycloak.users.update(
        { id: userId },
        {
          ...user,
          attributes: {
            ...user.attributes,
            company: input.company,
          },
        }
      )
    }),

  changePassword: protectedProcedure
    .input(z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.sub
      const email = ctx.session.user.email
      let accessToken = ''

      try {
        const { data: token } = await axios.post(
          `${env.KEYCLOAK_URL}/realms/${env.KEYCLOAK_REALM_NAME}/protocol/openid-connect/token`,
          new URLSearchParams({
            grant_type: 'password',
            client_id: env.KEYCLOAK_CLIENT_ID,
            client_secret: env.KEYCLOAK_CLIENT_SECRET,
            username: ctx.session.user.email,
            password: input.currentPassword,
          }),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        )

        accessToken = token.access_token
      } catch (error) {
        const errorMessage = (error as any).response.data.error

        if (errorMessage === 'invalid_grant') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'INVALID_PASSWORD' })
        }

        throw error
      }

      const keycloakJwtPayload: KeycloakJwtPayload = jwtDecode(accessToken)

      if (keycloakJwtPayload.sub !== userId || keycloakJwtPayload.email !== email) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      await authenticateKeycloakClient()

      const user = await keycloak.users.findOne({ id: userId })

      if (!user || !user.id)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'USER_NOT_FOUND',
        })

      await keycloak.users.update(
        { id: userId },
        {
          ...user,
          email,
          credentials: [{ type: 'password', value: input.newPassword, temporary: false }],
        }
      )

      await keycloak.users.logout({ id: userId })
    }),

  requestEmailChange: protectedProcedure
    .input(z.object({ fundSlug: z.enum(fundSlugs), newEmail: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.sub
      const email = ctx.session.user.email

      await authenticateKeycloakClient()
      const usersAlreadyUsingEmail = await keycloak.users.find({ email: input.newEmail })

      if (usersAlreadyUsingEmail.length) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'EMAIL_TAKEN' })
      }

      const user = await keycloak.users.findOne({ id: userId })

      if (!user || !user.id || !user.email)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'USER_NOT_FOUND',
        })

      let emailVerifyTokenVersion = parseInt(user.attributes?.emailVerifyTokenVersion?.[0]) || null

      if (!emailVerifyTokenVersion) {
        await keycloak.users.update(
          { id: userId },
          { ...user, attributes: { ...user.attributes, emailVerifyTokenVersion: 1 } }
        )
        emailVerifyTokenVersion = 1
      }

      const payload: UserSettingsJwtPayload = {
        action: 'email_verify',
        userId: user.id,
        email: input.newEmail,
        tokenVersion: emailVerifyTokenVersion,
      }

      const token = jwt.sign(payload, env.USER_SETTINGS_JWT_SECRET, { expiresIn: '30m' })

      // no await here as we don't want to block the response
      transporter.sendMail({
        from: env.SES_VERIFIED_SENDER,
        to: input.newEmail,
        subject: 'Verify your email',
        html: `<a href="${env.APP_URL}/${input.fundSlug}/verify-email/${token}" target="_blank">Verify email</a>`,
      })
    }),

  changeMailingAddress: protectedProcedure
    .input(
      z.object({
        addressLine1: z.string().min(1),
        addressLine2: z.string(),
        city: z.string().min(1),
        state: z.string(),
        country: z.string().min(1),
        zip: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await authenticateKeycloakClient()

      const userId = ctx.session.user.sub
      const user = await keycloak.users.findOne({ id: userId })

      if (!user || !user.id)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'USER_NOT_FOUND',
        })

      await keycloak.users.update(
        { id: userId },
        {
          ...user,
          attributes: {
            ...user.attributes,
            addressLine1: input.addressLine1,
            addressLine2: input.addressLine2,
            addressZip: input.zip,
            addressCity: input.city,
            addressState: input.state,
            addressCountry: input.country,
          },
        }
      )
    }),

  getUserAttributes: protectedProcedure.query(async ({ ctx }) => {
    await authenticateKeycloakClient()

    const userId = ctx.session.user.sub
    const user = await keycloak.users.findOne({ id: userId })

    if (!user || !user.id)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'USER_NOT_FOUND',
      })

    const pgAccountConnection = await prisma.accountConnection.findFirst({
      where: { type: 'privacyGuidesForum', userId },
    })

    return {
      company: (user.attributes?.company?.[0] as string) || '',
      addressLine1: (user.attributes?.addressLine1?.[0] as string) || '',
      addressLine2: (user.attributes?.addressLine2?.[0] as string) || '',
      addressZip: (user.attributes?.addressZip?.[0] as string) || '',
      addressCity: (user.attributes?.addressCity?.[0] as string) || '',
      addressState: (user.attributes?.addressState?.[0] as string) || '',
      addressCountry: (user.attributes?.addressCountry?.[0] as string) || '',
      privacyGuidesDiscourseUsername: pgAccountConnection?.externalId,
    }
  }),

  linkPrivacyGuidesAccount: protectedProcedure.mutation(async ({ ctx }) => {
    await authenticateKeycloakClient()

    const userId = ctx.session.user.sub
    const user = await keycloak.users.findOne({ id: userId })

    if (!user || !user.id)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'USER_NOT_FOUND',
      })

    const existingAccountConnection = await prisma.accountConnection.findFirst({
      where: { type: 'privacyGuidesForum', userId },
    })

    if (existingAccountConnection)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Account already linked.',
      })

    const nonce = crypto.randomBytes(32).toString('hex')

    const payload = {
      nonce,
      return_sso_url: `${env.APP_URL}/privacyguides/account/link-community-account`,
    }

    const payloadStr = Object.entries(payload)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')

    const payloadBase64 = btoa(payloadStr)
    const payloadBase64UrlEncoded = encodeURIComponent(payloadBase64)

    const signatureHex = crypto
      .createHmac('sha256', env.PRIVACYGUIDES_DISCOURSE_CONNECT_SECRET)
      .update(payloadBase64)
      .digest('hex')

    await keycloak.users.update(
      { id: userId },
      {
        ...user,
        attributes: {
          ...user.attributes,
          privacyGuidesDiscourseLinkNonce: nonce,
        },
      }
    )

    return {
      url: `${env.PRIVACYGUIDES_DISCOURSE_URL}/session/sso_provider?sso=${payloadBase64UrlEncoded}&sig=${signatureHex}`,
    }
  }),

  unlinkPrivacyGuidesAccount: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.sub

    const accountConnection = await prisma.accountConnection.findFirst({
      where: { type: 'privacyGuidesForum', userId },
    })

    if (!accountConnection) return

    if (accountConnection.privacyGuidesAccountIsInMemberGroup) {
      await privacyGuidesDiscourseApi.delete(
        `/groups/${env.PRIVACYGUIDES_DISCOURSE_MEMBERSHIP_GROUP_ID}/members.json`,
        {
          data: { usernames: accountConnection.externalId },
        }
      )
    }

    await prisma.accountConnection.delete({ where: { id: accountConnection.id } })
  }),
})
