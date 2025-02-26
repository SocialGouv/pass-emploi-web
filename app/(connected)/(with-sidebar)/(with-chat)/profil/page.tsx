import { Metadata } from 'next'
import React from 'react'

import ProfilPage from 'app/(connected)/(with-sidebar)/(with-chat)/profil/ProfilPage'
import { PageHeaderPortal } from 'components/PageNavigationPortals'
import { Agence } from 'interfaces/referentiel'
import { estMilo, structureMilo } from 'interfaces/structure'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getAgencesServerSide } from 'services/referentiel.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

export const metadata: Metadata = { title: 'Mon profil' }

export default async function Profil() {
  const { user, accessToken } = await getMandatorySessionServerSide()

  let referentielMissionsLocales: Agence[] = []
  if (estMilo(user.structure)) {
    const conseiller = await getConseillerServerSide(user, accessToken)
    if (!conseiller.agence) {
      referentielMissionsLocales = await getAgencesServerSide(
        structureMilo,
        accessToken
      )
    }
  }

  return (
    <>
      <PageHeaderPortal header='Profil' />

      <ProfilPage referentielMissionsLocales={referentielMissionsLocales} />
    </>
  )
}
