import { apm } from '@elastic/apm-rum'
import {
  SessionContextValue,
  signIn,
  useSession as _useSession,
  UseSessionOptions,
} from 'next-auth/react'
import { useEffect } from 'react'

import { RefreshAccessTokenError } from 'utils/auth/authenticator'

export default function useSession<R extends boolean>({
  required,
}: UseSessionOptions<R>): SessionContextValue<R> {
  const sessionContext: SessionContextValue<R> = _useSession<R>({
    required,
  })

  if (sessionContext.data) {
    const { data: session } = sessionContext
    const userAPM = {
      id: session.user.id,
      username: session.user.name,
      email: session.user.email ?? '',
    }
    apm.setUserContext(userAPM)
  }

  // https://next-auth.js.org/tutorials/refresh-token-rotation
  useEffect(() => {
    if (sessionContext.data?.error === RefreshAccessTokenError) {
      signIn() // Force sign in to hopefully resolve error
    }
  }, [sessionContext.data?.error])

  return sessionContext
}
