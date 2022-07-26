import { useEffect } from 'react'

import { trackPage, userStructureDimensionString } from 'utils/analytics/matomo'
import useSession from 'utils/auth/useSession'

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
