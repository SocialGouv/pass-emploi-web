import { useEffect } from 'react'

import { trackPage, userStructureDimensionString } from 'utils/analytics/matomo'
import { useConseillerPotentiellementPasRecupere } from 'utils/conseiller/conseillerContext'

function useMatomo(
  title: string | undefined,
  avecBeneficiaires?: string | undefined
) {
  const [conseiller] = useConseillerPotentiellementPasRecupere()

  useEffect(() => {
    if (!title) {
      return
    }
    if (!avecBeneficiaires) {
      return
    }

    const structure = !conseiller
      ? 'visiteur'
      : userStructureDimensionString(conseiller.structure)

    trackPage({
      structure: structure,
      customTitle: title,
      avecBeneficiaires: avecBeneficiaires,
    })
  }, [conseiller, title])
}

export default useMatomo
