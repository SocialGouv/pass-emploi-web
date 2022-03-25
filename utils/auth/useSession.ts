import { apm } from '@elastic/apm-rum'
import {
  SessionContextValue,
  useSession as _useSession,
  UseSessionOptions,
} from 'next-auth/react'

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

  return sessionContext
}
