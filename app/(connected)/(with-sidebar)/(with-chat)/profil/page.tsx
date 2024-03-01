import { Metadata } from 'next'
import React from 'react'

import ProfilPage from 'app/(connected)/(with-sidebar)/(with-chat)/profil/ProfilPage'
import { PageHeaderPortal } from 'components/PageNavigationPortals'
import { estUserMilo } from 'interfaces/conseiller'
import { Agence } from 'interfaces/referentiel'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getAgencesServerSide } from 'services/referentiel.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

export const metadata: Metadata = { title: 'Mon profil' }

export default async function Profil() {
  const { user, accessToken } = await getMandatorySessionServerSide()

  let referentielAgences: Agence[] = []
  if (estUserMilo(user)) {
    const conseiller = await getConseillerServerSide(user, accessToken)
    if (!conseiller.agence) {
      referentielAgences = await getAgencesServerSide(
        user.structure,
        accessToken
      )
    }
  }

  return (
    <>
      <PageHeaderPortal header='Profil' />

      <ProfilPage referentielAgences={referentielAgences} />
    </>
  )
}
