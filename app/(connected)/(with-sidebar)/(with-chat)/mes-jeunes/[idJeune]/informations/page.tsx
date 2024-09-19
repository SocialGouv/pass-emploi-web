import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import InformationsPage, {
  Onglet,
} from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/informations/InformationsPage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import { getNomBeneficiaireComplet } from 'interfaces/beneficiaire'
import { estUserFranceTravail } from 'interfaces/conseiller'
import {
  getConseillersDuJeuneServerSide,
  getJeuneDetails,
  getMetadonneesFavorisJeune,
} from 'services/jeunes.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

type InformationsParams = { idJeune: string }
type InformationsSearchParams = Partial<{ onglet: Onglet }>

export async function generateMetadata({
  params,
}: {
  params: InformationsParams
}): Promise<Metadata> {
  const { user, accessToken } = await getMandatorySessionServerSide()
  const beneficiaire = await getJeuneDetails(params.idJeune, accessToken)
  if (!beneficiaire) notFound()

  const lectureSeule = user.id !== beneficiaire.idConseiller
  return {
    title: `Informations - ${getNomBeneficiaireComplet(beneficiaire)} - ${lectureSeule ? 'Etablissement' : 'Portefeuille'}`,
  }
}

export default async function Informations({
  params,
  searchParams,
}: {
  params: InformationsParams
  searchParams?: InformationsSearchParams
}) {
  const { user, accessToken } = await getMandatorySessionServerSide()
  const beneficiaire = await getJeuneDetails(params.idJeune, accessToken)
  if (!beneficiaire) notFound()

  const [metadonneesJeune, conseillers] = await Promise.all([
    getMetadonneesFavorisJeune(params.idJeune, accessToken),
    getConseillersDuJeuneServerSide(beneficiaire.id, accessToken),
  ])

  const lectureSeule = beneficiaire.idConseiller !== user.id
  return (
    <>
      <PageFilArianePortal />
      <PageHeaderPortal header={`${beneficiaire.prenom} ${beneficiaire.nom}`} />

      <InformationsPage
        conseillers={conseillers}
        idBeneficiaire={beneficiaire.id}
        situations={beneficiaire.situations}
        lectureSeule={lectureSeule}
        beneficiaire={beneficiaire}
        metadonneesFavoris={metadonneesJeune}
        onglet={searchParamToOnglet(
          searchParams?.onglet,
          estUserFranceTravail(user)
        )}
      />
    </>
  )
}

function searchParamToOnglet(
  onglet: string | undefined,
  estFranceTravail: boolean
): Onglet {
  switch (onglet) {
    case 'indicateurs':
      return estFranceTravail ? 'INFORMATIONS' : 'INDICATEURS'
    case 'conseillers':
      return 'CONSEILLERS'
    case 'informations':
    default:
      return 'INFORMATIONS'
  }
}
