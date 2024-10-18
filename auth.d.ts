import { Session } from 'next-auth'
import { DefaultJWT, JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session extends Session {
    error?: 'RefreshAccessTokenError'
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    accessToken: string
    accessTokenExpiresAt: number
    refreshToken: string
    error?: 'RefreshAccessTokenError'
  }
}
