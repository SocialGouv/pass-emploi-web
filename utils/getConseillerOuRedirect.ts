import { Conseiller } from 'interfaces'
import { Redirect } from 'next'
import { getConseillerFromSession, NextIronRequest } from './session'

export default function getConseillerOuRedirect(
  req: NextIronRequest
):
  | { conseiller: Conseiller; hasConseiller: true }
  | { redirect: Redirect; hasConseiller: false } {
  const conseiller = getConseillerFromSession(req)
  if (conseiller === undefined) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
      hasConseiller: false,
    }
  }

  return { conseiller, hasConseiller: true }
}
