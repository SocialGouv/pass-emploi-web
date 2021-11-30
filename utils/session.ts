// this file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions
import { Conseiller } from 'interfaces'
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next'
import { Session, withIronSession } from 'next-iron-session'

export type NextIronRequest = NextApiRequest & { session: Session }
type ServerSideContext = GetServerSidePropsContext & { req: NextIronRequest }

/**
 * Inspired from https://github.com/vvo/next-iron-session/issues/368
 */

export type ApiHandler = (
  req: NextIronRequest,
  res: NextApiResponse
) => Promise<void>

export type ServerSideHandler<P extends { [key: string]: any }> = (
  context: ServerSideContext
) => ReturnType<GetServerSideProps<P>>

export const SESSION_KEYS = { USER: 'user' }

const withSession = <T extends ApiHandler | ServerSideHandler<any>>(
  handler: T
) =>
  withIronSession(handler, {
    password: process.env.AUTH_COOKIE_PASSWORD || '',
    cookieName: process.env.AUTH_COOKIE_NAME || '',
    cookieOptions: {
      // the next line allows to use the session in non-https environments like
      // Next.js dev mode (http://localhost:3000)
      secure: process.env.NODE_ENV === 'production',
    },
  })

export default withSession

export function getConseillerFromSession(
  req: NextIronRequest
): Conseiller | undefined {
  return req.session.get<Conseiller>(SESSION_KEYS.USER)
}
