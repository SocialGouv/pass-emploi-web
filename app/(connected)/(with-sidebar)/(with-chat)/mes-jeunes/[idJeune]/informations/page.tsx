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
import { estConseillerReferent } from 'interfaces/conseiller'
import { estMilo } from 'interfaces/structure'
import {
  getConseillersDuJeuneServerSide,
  getJeuneDetails,
  getMetadonneesFavorisJeune,
} from 'services/beneficiaires.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

type InformationsParams = Promise<{ idJeune: string }>
type InformationsSearchParams = Promise<Partial<{ onglet: Onglet }>>
type RouteProps = {
  params: InformationsParams
  searchParams?: InformationsSearchParams
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { user, accessToken } = await getMandatorySessionServerSide()
  const { idJeune } = await params
  const beneficiaire = await getJeuneDetails(idJeune, accessToken)
  if (!beneficiaire) notFound()

  const lectureSeule = !estConseillerReferent(user, beneficiaire)
  return {
    title: `Informations - ${getNomBeneficiaireComplet(beneficiaire)} - ${lectureSeule ? 'Etablissement' : 'Portefeuille'}`,
  }
}

export default async function Informations({
  params,
  searchParams,
}: RouteProps) {
  const { user, accessToken } = await getMandatorySessionServerSide()
  const { idJeune } = await params
  const beneficiaire = await getJeuneDetails(idJeune, accessToken)
  if (!beneficiaire) notFound()

  const [metadonneesJeune, conseillers] = await Promise.all([
    getMetadonneesFavorisJeune(idJeune, accessToken),
    getConseillersDuJeuneServerSide(beneficiaire.id, accessToken),
  ])

  const { onglet } = (await searchParams) ?? {}
  return (
    <>
      <PageFilArianePortal />
      <PageHeaderPortal header={`${beneficiaire.prenom} ${beneficiaire.nom}`} />

      <InformationsPage
        conseillers={conseillers}
        idBeneficiaire={beneficiaire.id}
        situations={beneficiaire.situations}
        beneficiaire={beneficiaire}
        metadonneesFavoris={metadonneesJeune}
        onglet={searchParamToOnglet(onglet, estMilo(user.structure))}
      />
    </>
  )
}

function searchParamToOnglet(
  onglet: string | undefined,
  forMilo: boolean
): Onglet {
  switch (onglet) {
    case 'indicateurs':
      return forMilo ? 'INDICATEURS' : 'INFORMATIONS'
    case 'conseillers':
      return 'CONSEILLERS'
    case 'informations':
    default:
      return 'INFORMATIONS'
  }
}
