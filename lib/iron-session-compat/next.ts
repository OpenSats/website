// Custom implementation of iron-session/next using iron-session
import { getIronSession } from 'iron-session'
import { NextApiHandler, GetServerSidePropsContext, GetServerSidePropsResult } from 'next'

export interface IronSessionOptions {
  password: string
  cookieName: string
  cookieOptions?: {
    secure?: boolean
    httpOnly?: boolean
    sameSite?: boolean | 'none' | 'strict' | 'lax'
    path?: string
    domain?: string
    maxAge?: number
  }
  ttl?: number
}

export interface IronSessionData {
  [key: string]: any
}

export interface IronSession extends IronSessionData {
  destroy(): void
  save(): Promise<void>
}

export function withIronSessionApiRoute<T extends NextApiHandler>(
  handler: (req: Parameters<T>[0] & { session: IronSession }, res: Parameters<T>[1]) => ReturnType<T>,
  options: IronSessionOptions
): NextApiHandler {
  return async function withIronSessionApiRouteWrapper(req, res) {
    const session = await getIronSession(req, res, options)
    req.session = session
    return handler(req, res)
  }
}

export function withIronSessionSsr<
  P extends { [key: string]: unknown } = { [key: string]: unknown },
>(
  handler: (
    context: GetServerSidePropsContext & { req: { session: IronSession } }
  ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>,
  options: IronSessionOptions
): (context: GetServerSidePropsContext) => Promise<GetServerSidePropsResult<P>> {
  return async function withIronSessionSsrWrapper(context) {
    const { req, res } = context
    const session = await getIronSession(req, res, options)
    req.session = session
    return handler(context as GetServerSidePropsContext & { req: { session: IronSession } })
  }
}
