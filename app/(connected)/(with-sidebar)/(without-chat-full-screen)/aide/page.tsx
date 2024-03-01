import { Metadata } from 'next'

import AidePage from 'app/(connected)/(with-sidebar)/(without-chat-full-screen)/aide/AidePage'
import { PageHeaderPortal } from 'components/PageNavigationPortals'

export const metadata: Metadata = { title: 'Aide et ressources' }

export default async function Aide() {
  return (
    <>
      <PageHeaderPortal header='Aide et ressources' />

      <AidePage />
    </>
  )
}
