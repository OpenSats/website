import type { IronSessionOptions } from 'iron-session'
import { withIronSessionApiRoute, withIronSessionSsr } from 'iron-session/next'
import type { NextApiHandler } from 'next'

// This is where we specify the typings of req.session.*
declare module 'iron-session' {
  interface IronSessionData {
    email?: string
    grantId?: string
  }
}

const sessionOptions: IronSessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'opensats_grant_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
}

export function withSessionRoute(handler: NextApiHandler) {
  return withIronSessionApiRoute(handler, sessionOptions)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withSessionSsr(handler: any) {
  return withIronSessionSsr(handler, sessionOptions)
}
