import { Metadata } from 'next'

import RaccourciPage from 'app/(connected)/(with-sidebar)/(without-chat)/raccourci/RaccourciPage'
import {
  PageHeaderPortal,
  PageRetourPortal,
} from 'components/PageNavigationPortals'

export const metadata: Metadata = { title: 'Tutoriel raccourci mobile' }

export default function Raccourci() {
  return (
    <>
      <PageRetourPortal lien='/mes-jeunes' />
      <PageHeaderPortal header='Créer un raccourci' />

      <RaccourciPage />
    </>
  )
}
