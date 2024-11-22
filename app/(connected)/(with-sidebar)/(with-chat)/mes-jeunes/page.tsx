import { DateTime } from 'luxon'
import { Metadata } from 'next'

import PortefeuillePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/PortefeuillePage'
import { PageHeaderPortal } from 'components/PageNavigationPortals'
import {
  BeneficiaireAvecCompteursActionsRdvs,
  compareBeneficiairesByNom,
  CompteursPeriode,
} from 'interfaces/beneficiaire'
import { estUserMilo } from 'interfaces/conseiller'
import {
  getBeneficiairesDuConseillerServerSide,
  recupereCompteursBeneficiairesPortefeuilleMilo,
} from 'services/beneficiaires.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

export const metadata: Metadata = { title: 'Portefeuille' }

type PortfeuilleSearchParams = Partial<{ source: string }>
export default async function Portefeuille({
  searchParams,
}: {
  searchParams?: PortfeuilleSearchParams
}) {
  const { user, accessToken } = await getMandatorySessionServerSide()
  const beneficiaires = await getBeneficiairesDuConseillerServerSide(
    user.id,
    accessToken
  )

  let beneficiairesAvecCompteurs: BeneficiaireAvecCompteursActionsRdvs[]
  if (estUserMilo(user)) {
    const dateDebut = DateTime.now().startOf('week')
    const dateFin = DateTime.now().endOf('week')
    const compteurActionsPeriode: CompteursPeriode[] =
      await recupereCompteursBeneficiairesPortefeuilleMilo(
        user.id,
        dateDebut,
        dateFin,
        accessToken
      )

    beneficiairesAvecCompteurs = beneficiaires.map((beneficiaire) => {
      const compteursPeriode = compteurActionsPeriode.find(
        (compteurs) => compteurs.idBeneficiaire === beneficiaire.id
      )

      return {
        ...beneficiaire,
        actionsCreees: compteursPeriode?.actions ?? 0,
        rdvs: compteursPeriode?.rdvs ?? 0,
      }
    })
  } else {
    beneficiairesAvecCompteurs = beneficiaires.map((beneficiaire) => ({
      ...beneficiaire,
      actionsCreees: 0,
      rdvs: 0,
    }))
  }

  beneficiairesAvecCompteurs.sort(compareBeneficiairesByNom)
  return (
    <>
      <PageHeaderPortal header='Portefeuille' />

      <PortefeuillePage
        conseillerJeunes={beneficiairesAvecCompteurs}
        isFromEmail={Boolean(searchParams?.source)}
      />
    </>
  )
}
