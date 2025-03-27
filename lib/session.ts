import { getIronSession } from 'iron-session'
import {
  NextApiHandler,
  NextApiRequest,
  NextApiResponse,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next'
import { ServerResponse } from 'http'

// Extend the NextApiRequest type to include session
declare module 'next' {
  interface NextApiRequest {
    session: {
      email?: string
      destroy: () => Promise<void>
      save: () => Promise<void>
    }
  }
}

// Extend the IncomingMessage type for GetServerSideProps
declare module 'http' {
  interface IncomingMessage {
    session?: {
      email?: string
      destroy: () => Promise<void>
      save: () => Promise<void>
    }
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

// Wrapper for API routes
export function withSessionRoute(handler: NextApiHandler) {
  return async function newHandler(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<unknown> {
    req.session = await getIronSession(req, res, sessionOptions)
    return handler(req, res)
  }
}

// Wrapper for SSR pages
export function withSessionSsr<P extends Record<string, unknown>>(
  handler: (
    context: GetServerSidePropsContext
  ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>
) {
  return async function newHandler(
    context: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> {
    context.req.session = await getIronSession(
      context.req,
      context.res as ServerResponse,
      sessionOptions
    )
    return handler(context)
  }
}

// Type for the session data
declare module 'iron-session' {
  interface IronSessionData {
    email?: string
  }
}
