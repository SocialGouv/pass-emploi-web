import { useEffect } from 'react'
import { track } from 'utils/analytics/matomo'
import { useSession } from 'next-auth/react'
import { UserStructure } from 'interfaces/conseiller'

function userStructureDimensionString(loginMode: string): string {
  switch (loginMode) {
    case UserStructure.MILO:
      return 'Mission Locale'
    case UserStructure.POLE_EMPLOI:
      return 'Pôle emploi'
  }
  return 'pass emploi'
}

function useMatomo(title: string | undefined) {
  const { data: session } = useSession({ required: false })

  useEffect(() => {
    if (!title) {
      return
    }

    const structure = !session
      ? 'visiteur'
      : userStructureDimensionString(session.user.structure)

    track({
      structure: structure,
      customTitle: title,
    })
  }, [session, title])
}

export default useMatomo
