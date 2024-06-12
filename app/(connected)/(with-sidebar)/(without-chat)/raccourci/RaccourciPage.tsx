'use client'

import { withTransaction } from '@elastic/apm-rum-react'

import { TutorielRaccourci } from 'components/TutorielRaccourci'
import useMatomo from 'utils/analytics/useMatomo'
import { usePortefeuille } from 'utils/portefeuilleContext'

function RaccourciPage() {
  const [portefeuille] = usePortefeuille()
  useMatomo('Tuto raccourci mobile', portefeuille.length > 0)

  return <TutorielRaccourci />
}

export default withTransaction(RaccourciPage.name, 'page')(RaccourciPage)
