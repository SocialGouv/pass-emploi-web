import { useEffect } from 'react'
import { track } from 'utils/analytics/matomo'
import { useSession } from 'next-auth/react'
import { UserStructure } from 'interfaces/conseiller'

function userStructureDimensionString(loginMode: string | undefined): string {
  switch (loginMode) {
    case UserStructure.MILO:
      return 'Mission Locale'
    case UserStructure.POLE_EMPLOI:
      return 'Pôle emploi'
    case UserStructure.PASS_EMPLOI:
      return 'pass emploi'
  }
  return ''
}

function useMatomo(title: string | undefined) {
  const { data: session } = useSession({ required: true })

  useEffect(() => {
    if (!title) {
      return
    }

    track({
      structure: userStructureDimensionString(session?.user.structure),
      customTitle: title,
    })
  }, [session?.user.structure, title])
}

export default useMatomo
