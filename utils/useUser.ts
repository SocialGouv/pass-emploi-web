import { Conseiller } from 'interfaces'
import Router from 'next/router'
import { useEffect } from 'react'
import useSWR from 'swr'
import { KeyedMutator } from 'swr/dist/types'

export default function useUser({
  redirectTo = '',
  redirectIfFound = false,
} = {}): { user?: Conseiller; mutateUser: KeyedMutator<Conseiller> } {
  const SRW_KEY_USER = '/api/user'
  const { data: user, mutate: mutateUser } = useSWR<Conseiller>(SRW_KEY_USER)
  useEffect(() => {
    // if no redirect needed, just return (example: already on /dashboard)
    // if user data not yet there (fetch in progress, logged in or not) then don't do anything yet
    if (!redirectTo) return

    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !user) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && user)
    ) {
      Router.push(redirectTo)
    }
  }, [user, redirectIfFound, redirectTo])

  return { user, mutateUser }
}
