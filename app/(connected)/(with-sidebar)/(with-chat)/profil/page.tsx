import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import React from 'react'

import ProfilPage from 'app/(connected)/(with-sidebar)/(with-chat)/profil/ProfilPage'
import { PageHeaderPortal } from 'components/PageNavigationPortals'
import { Conseiller, StructureConseiller } from 'interfaces/conseiller'
import { Agence } from 'interfaces/referentiel'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getAgencesServerSide } from 'services/referentiel.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'
import { ApiError } from 'utils/httpClient'

export const metadata: Metadata = { title: 'Mon profil' }

export default async function Profil() {
  const { user, accessToken } = await getMandatorySessionServerSide()

  let referentielAgences: Agence[] = []
  if (user.structure === StructureConseiller.MILO) {
    let conseiller: Conseiller | undefined
    try {
      conseiller = await getConseillerServerSide(user, accessToken)
    } catch (e) {
      if (e instanceof ApiError && e.statusCode === 401) {
        redirect('/api/auth/federated-logout')
      }
      throw e
    }
    if (!conseiller) notFound()

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
