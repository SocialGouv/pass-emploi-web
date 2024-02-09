'use client'

import { withTransaction } from '@elastic/apm-rum-react'

import { TutorielRaccourci } from 'components/TutorielRaccourci'
import useMatomo from 'utils/analytics/useMatomo'

function RaccourciPage() {
  useMatomo('Tuto raccourci mobile')

  return <TutorielRaccourci />
}

export default withTransaction(RaccourciPage.name, 'page')(RaccourciPage)
