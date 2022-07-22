import { useEffect } from 'react'

import { UserStructure } from 'interfaces/conseiller'
import { trackPage } from 'utils/analytics/matomo'
import useSession from 'utils/auth/useSession'

export function userStructureDimensionString(loginMode: string): string {
  switch (loginMode) {
    case UserStructure.MILO:
      return 'Mission Locale'
    case UserStructure.POLE_EMPLOI:
      return 'Pôle emploi'
  }
  return 'pass emploi'
}

function useMatomo(title: string | undefined) {
  const { data: session } = useSession<false>({ required: false })

  useEffect(() => {
    if (!title) {
      return
    }

    const structure = !session
      ? 'visiteur'
      : userStructureDimensionString(session.user.structure)

    trackPage({
      structure: structure,
      customTitle: title,
    })
  }, [session, title])
}

export default useMatomo
