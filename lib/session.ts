import type { IronSessionOptions } from '@/lib/iron-session-compat/next'
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiHandler,
} from 'next'
import {
  withIronSessionApiRoute,
  withIronSessionSsr,
} from '@/lib/iron-session-compat/next'

export interface SessionData {
  email?: string
  email_hash?: string
  isLoggedIn: boolean
}

const sessionOptions: IronSessionOptions = {
  password:
    process.env.SECRET_COOKIE_PASSWORD ||
    'complex_password_at_least_32_characters_long',
  cookieName: 'opensats_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}

export function withSessionRoute(handler: NextApiHandler) {
  return withIronSessionApiRoute(handler, sessionOptions)
}

export function withSessionSsr<
  P extends { [key: string]: unknown } = { [key: string]: unknown }
>(
  handler: (
    context: GetServerSidePropsContext
  ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>
) {
  return withIronSessionSsr(handler, sessionOptions)
}

declare module 'iron-session' {
  interface IronSessionData extends SessionData {
    // Add any additional session properties here
    timestamp?: number
  }
}
