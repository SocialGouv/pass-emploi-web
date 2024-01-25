import { DateTime } from 'luxon'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import FicheBeneficiairePage, {
  Onglet,
} from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[jeune_id]/FicheBeneficiairePage' // Onglet,
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import { SituationNonProfessionnelle } from 'interfaces/action'
import {
  Conseiller,
  estUserPoleEmploi,
  peutAccederAuxSessions,
} from 'interfaces/conseiller'
import { EvenementListItem, PeriodeEvenements } from 'interfaces/evenement'
import { Offre, Recherche } from 'interfaces/favoris'
import {
  getActionsJeuneServerSide,
  getSituationsNonProfessionnelles,
} from 'services/actions.service'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getRendezVousJeune } from 'services/evenements.service'
import { getOffres, getRecherchesSauvegardees } from 'services/favoris.service'
import {
  getJeuneDetails,
  getMetadonneesFavorisJeune,
} from 'services/jeunes.service'
import { getSessionsMiloBeneficiaire } from 'services/sessions.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'
import { compareDates } from 'utils/date'
import { ApiError } from 'utils/httpClient'

type FicheBeneficiaireParams = { jeune_id: string }
type FicheBeneficiaireSearchParams = { page?: string; onglet?: string }

export async function generateMetadata({
  params,
}: {
  params: FicheBeneficiaireParams
}): Promise<Metadata> {
  const { user, accessToken } = await getMandatorySessionServerSide()
  const jeune = await getJeuneDetails(params.jeune_id, accessToken)
  if (!jeune) notFound()

  if (jeune.idConseiller !== user.id) {
    return { title: `Établissement - ${jeune.prenom} ${jeune.nom}` }
  }
  return { title: `Portefeuille - ${jeune.prenom} ${jeune.nom}` }
}

export default async function FicheBeneficiaire({
  params,
  searchParams,
}: {
  params: FicheBeneficiaireParams
  searchParams?: FicheBeneficiaireSearchParams
}) {
  const { user, accessToken } = await getMandatorySessionServerSide()
  const userIsPoleEmploi = estUserPoleEmploi(user)

  const page = searchParams?.page ? parseInt(searchParams.page) : 1

  let conseiller: Conseiller | undefined
  try {
    conseiller = await getConseillerServerSide(user, accessToken)
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 401) {
      // TODO redirect in http-client quand le router "page" aura disparu
      redirect('/api/auth/federated-logout')
    }
    throw e
  }
  if (!conseiller) notFound()

  const [jeune, metadonneesFavoris, rdvs, actions, categoriesActions] =
    await Promise.all([
      getJeuneDetails(params.jeune_id, accessToken),
      getMetadonneesFavorisJeune(params.jeune_id, accessToken),
      userIsPoleEmploi
        ? ([] as EvenementListItem[])
        : getRendezVousJeune(
            params.jeune_id,
            PeriodeEvenements.FUTURS,
            accessToken
          ),
      userIsPoleEmploi
        ? { actions: [], metadonnees: { nombreTotal: 0, nombrePages: 0 } }
        : getActionsJeuneServerSide(params.jeune_id, page, accessToken),
      userIsPoleEmploi
        ? ([] as SituationNonProfessionnelle[])
        : getSituationsNonProfessionnelles({ avecNonSNP: false }, accessToken),
    ])
  if (!jeune) notFound()

  let sessionsMilo: EvenementListItem[] = []
  if (peutAccederAuxSessions(conseiller)) {
    try {
      sessionsMilo = await getSessionsMiloBeneficiaire(
        params.jeune_id,
        accessToken,
        DateTime.now().startOf('day')
      )
    } catch (e) {
      if (e instanceof ApiError && e.statusCode === 401) {
        // TODO redirect in http-client quand le router "page" aura disparu
        redirect('/api/auth/federated-logout')
      }
      sessionsMilo = []
    }
  }

  let offresPE: Offre[] = []
  let recherchesPE: Recherche[] = []
  if (metadonneesFavoris?.autoriseLePartage) {
    ;[offresPE, recherchesPE] = await Promise.all([
      userIsPoleEmploi ? getOffres(params.jeune_id, accessToken) : [],
      userIsPoleEmploi
        ? getRecherchesSauvegardees(params.jeune_id, accessToken)
        : [],
    ])
  }

  const rdvsEtSessionsTriesParDate = [...rdvs]
    .concat(sessionsMilo)
    .sort((event1, event2) =>
      compareDates(DateTime.fromISO(event1.date), DateTime.fromISO(event2.date))
    )

  let onglet: Onglet
  switch (searchParams?.onglet) {
    case 'actions':
      onglet = 'ACTIONS'
      break
    case 'rdvs':
      onglet = 'RDVS'
      break
    case 'favoris':
      onglet = 'FAVORIS'
      break
    default:
      onglet = 'AGENDA'
  }

  return (
    <>
      <PageFilArianePortal />
      <PageHeaderPortal header={`${jeune.prenom} ${jeune.nom}`} />

      <FicheBeneficiairePage
        jeune={jeune}
        metadonneesFavoris={metadonneesFavoris}
        rdvs={rdvsEtSessionsTriesParDate}
        actionsInitiales={{ ...actions, page }}
        categoriesActions={categoriesActions}
        offresPE={offresPE}
        recherchesPE={recherchesPE}
        onglet={onglet}
        lectureSeule={jeune.idConseiller !== user.id}
      />
    </>
  )
}
