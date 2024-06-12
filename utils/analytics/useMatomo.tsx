import { useEffect } from 'react'

import { trackPage } from 'utils/analytics/matomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'

function useMatomo(title: string, aDesBeneficiaires: boolean) {
  const [conseiller] = useConseiller()

  useEffect(() => {
    trackPage({
      structure: conseiller.structure,
      customTitle: title,
      aDesBeneficiaires,
    })
  }, [conseiller, title])
}

export default useMatomo
