import { User } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt/types'

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: Session.HydratedUser
    accessToken: string
    firebaseToken: string
    error?: string
  }

  namespace Session {
    interface HydratedUser extends User {
      name: string
      structure: string
      estSuperviseur: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface HydratedJWT extends Record<string, unknown>, DefaultJWT {
    accessToken?: string
    refreshToken?: string
    firebaseToken?: string
    expiresAtTimestamp?: number
    idConseiller?: string
    structureConseiller?: string
    estSuperviseur?: boolean
  }
}
