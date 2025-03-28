// This file implements session management using iron-session
import { getIronSession } from 'iron-session'
import {
  NextApiHandler,
  NextApiRequest,
  NextApiResponse,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next'
import { ServerResponse } from 'http'

// This is where we specify the typings of req.session.*
declare module 'iron-session' {
  interface IronSessionData {
    email?: string
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

// Define the session configuration
export const sessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    'complex_password_at_least_32_characters_long',
  cookieName: 'opensats_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 24 hours
  },
}

export function withSessionRoute(handler: NextApiHandler) {
  return async function withSessionRouteWrapper(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    const session = await getIronSession(req, res, sessionOptions)
    // @ts-ignore - Type compatibility issues between iron-session versions
    req.session = session
    return handler(req, res)
  }
}

export function withSessionSsr<
  P extends { [key: string]: unknown } = { [key: string]: unknown },
>(handler: (context: GetServerSidePropsContext) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>) {
  return async function newHandler(
    context: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> {
    const session = await getIronSession(
      context.req,
      context.res as ServerResponse,
      sessionOptions
    )
    // @ts-ignore - Type compatibility issues between iron-session versions
    context.req.session = session
    return handler(context)
  }
}
