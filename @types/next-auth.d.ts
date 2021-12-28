import { DefaultJWT } from 'next-auth/jwt/types'

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string
      name: string
      structure: string
    }
    accessToken: string
    firebaseToken: string
    error?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends Record<string, unknown>, DefaultJWT {
    accessToken?: string
    refreshToken?: string
    expiresAtTimestamp?: number
    idConseiller?: string
    structureConseiller?: string
  }
}
