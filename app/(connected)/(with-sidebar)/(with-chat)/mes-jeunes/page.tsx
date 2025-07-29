import { DateTime } from 'luxon'
import { Metadata } from 'next'

import PortefeuillePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/PortefeuillePage'
import { PageHeaderPortal } from 'components/PageNavigationPortals'
import { CompteursBeneficiairePeriode } from 'interfaces/action'
import {
  BeneficiaireAvecCompteursActionsRdvs,
  compareBeneficiairesByNom,
} from 'interfaces/beneficiaire'
import { Liste } from 'interfaces/liste'
import {
  estAvenirPro,
  estFTConnect,
  estMilo,
  labelStructure,
} from 'interfaces/structure'
import { recupereCompteursBeneficiairesPortefeuilleMilo } from 'services/actions.service'
import { getBeneficiairesDuConseillerServerSide } from 'services/beneficiaires.service'
import { getListesServerSide } from 'services/listes.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

export const metadata: Metadata = { title: 'Portefeuille' }

type PortfeuilleSearchParams = Promise<
  Partial<{ source: string; page: string }>
>
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
  const { source, page } = (await searchParams) ?? {}

  const parsedPage = page ? parseInt(page, 10) : 1

  let beneficiairesAvecCompteurs: BeneficiaireAvecCompteursActionsRdvs[]
  if (estMilo(user.structure)) {
    const dateDebut = DateTime.now().startOf('week')
    const dateFin = DateTime.now().endOf('week')
    const compteurBeneficiairesPeriode: CompteursBeneficiairePeriode[] =
      await recupereCompteursBeneficiairesPortefeuilleMilo(
        user.id,
        dateDebut,
        dateFin,
        accessToken
      )

    beneficiairesAvecCompteurs = beneficiaires.map((beneficiaire) => {
      const { actionsCreees, rdvs } = compteurBeneficiairesPeriode.find(
        (compteurs) => compteurs.idBeneficiaire === beneficiaire.id
      ) ?? { actionsCreees: 0, rdvs: 0 }

      return { ...beneficiaire, actionsCreees, rdvs }
    })
  } else {
    beneficiairesAvecCompteurs = beneficiaires.map((beneficiaire) => ({
      ...beneficiaire,
      actionsCreees: 0,
      rdvs: 0,
    }))
  }

  let listes: Liste[] | undefined = undefined
  if (estAvenirPro(user.structure)) {
    try {
      listes = await getListesServerSide(user.id, accessToken)
    } catch (error) {
      console.error('Erreur lors de la récupération des listes:', error)
    }
  }

  const beneficiairesAlphabetiques = [...beneficiairesAvecCompteurs].sort(
    compareBeneficiairesByNom
  )

  const header =
    'Portefeuille' +
    (estFTConnect(user.structure) ? ` ${labelStructure(user.structure)}` : '')
  return (
    <>
      <PageHeaderPortal header={header} />

      <PortefeuillePage
        conseillerJeunes={beneficiairesAlphabetiques}
        isFromEmail={Boolean(source)}
        page={parsedPage || 1}
        listes={listes}
      />
    </>
  )
}
