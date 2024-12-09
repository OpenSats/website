import NextAuth, { AuthOptions } from 'next-auth'
import { jwtDecode } from 'jwt-decode'
import CredentialsProvider from 'next-auth/providers/credentials'
import axios from 'axios'

import { env } from '../../../env.mjs'
import { KeycloakJwtPayload } from '../../../server/types'
import { refreshToken } from '../../../server/utils/auth'
import { isTurnstileValid } from '../../../server/utils/turnstile'

export const authOptions: AuthOptions = {
  callbacks: {
    jwt: async ({ token, user, account }) => {
      // On sign in
      if (user && account) {
        const keycloakToken = (user as any).keycloakToken
        return {
          sub: user.id,
          email: user.email,
          accessToken: keycloakToken.access_token,
          accessTokenExpiresAt: Date.now() + (keycloakToken.expires_in as number) * 1000,
          refreshToken: keycloakToken.refresh_token,
        }
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < token.accessTokenExpiresAt) {
        return token
      }

      // Refresh access token
      return refreshToken(token)
    },
    session: ({ session, token }) => {
      return {
        user: {
          sub: token.sub,
          email: token.email,
        },
        error: token.error,
        expires: session.expires,
      }
    },
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        turnstileToken: { label: 'Turnstile token', type: 'password' },
      },
      authorize: async (credentials) => {
        if (await isTurnstileValid(credentials?.turnstileToken || '')) {
          throw new Error('INVALID_TURNSTILE_TOKEN')
        }

        try {
          const { data: keycloakToken } = await axios.post(
            `${env.KEYCLOAK_URL}/realms/${env.KEYCLOAK_REALM_NAME}/protocol/openid-connect/token`,
            new URLSearchParams({
              client_id: env.KEYCLOAK_CLIENT_ID,
              client_secret: env.KEYCLOAK_CLIENT_SECRET,
              grant_type: 'password',
              username: credentials?.email || '',
              password: credentials?.password || '',
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
          )

          const keycloakTokenPayload: KeycloakJwtPayload = jwtDecode(keycloakToken.access_token)

          return {
            id: keycloakTokenPayload.sub,
            email: keycloakTokenPayload.email,
            keycloakToken,
          }
        } catch (error) {
          const errorMessage = (error as any).response.data.error
          if (errorMessage === 'invalid_grant') {
            throw new Error('INVALID_CREDENTIALS')
          }
        }

        return null
      },
    }),
  ],
}

export default NextAuth(authOptions)
