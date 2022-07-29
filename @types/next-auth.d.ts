import { User } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt/types'

declare module 'next-auth' {
  /**
   * Returned by `getSession`
   */
  interface Session {
    user: Session.HydratedUser
    accessToken: string
    error?: string
  }

  namespace Session {
    interface HydratedUser extends User {
      name: string
      email: string
      structure: string
      estConseiller: boolean
      estSuperviseur: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface HydratedJWT extends Record<string, unknown>, DefaultJWT {
    accessToken?: string
    refreshToken?: string
    expiresAtTimestamp?: number
    idConseiller?: string
    structureConseiller?: string
    estConseiller?: boolean
    estSuperviseur?: boolean
  }
}
