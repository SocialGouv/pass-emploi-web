import { useEffect } from 'react'

import { trackPage, userStructureDimensionString } from 'utils/analytics/matomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'

function useMatomo(title: string | undefined) {
  const [conseiller] = useConseiller()

  useEffect(() => {
    if (!title) {
      return
    }

    const structure = !conseiller
      ? 'visiteur'
      : userStructureDimensionString(conseiller.structure)

    trackPage({
      structure: structure,
      customTitle: title,
    })
  }, [conseiller, title])
}

export default useMatomo
