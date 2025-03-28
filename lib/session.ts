// This file implements session management using iron-session
import { getIronSession } from 'iron-session'
import { NextApiRequest, NextApiResponse } from 'next'

export const sessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'opensats_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 24 hours
  },
}

// This is where we specify the typings of req.session.*
declare module 'iron-session' {
  interface IronSessionData {
    user?: {
      id: number
      admin?: boolean
    }
    grant_id?: string
    issue_number?: number
    project_name?: string
    report_number?: string
  }
}

export function withSessionRoute(handler: any) {
  return async function withSessionRouteWrapper(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    const session = await getIronSession(req, res, sessionOptions)
    req.session = session
    return handler(req, res)
  }
}

export function withSessionSsr(handler: any) {
  return async function withSessionSsrWrapper(context: any) {
    const { req, res } = context
    const session = await getIronSession(req, res, sessionOptions)
    context.req.session = session
    return handler(context)
  }
}
