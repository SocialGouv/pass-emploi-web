import { DateTime } from 'luxon'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import FicheBeneficiairePage, {
  Onglet,
} from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiairePage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import { SituationNonProfessionnelle } from 'interfaces/action'
import {
  estUserFranceTravail,
  peutAccederAuxSessions,
} from 'interfaces/conseiller'
import { EvenementListItem, PeriodeEvenements } from 'interfaces/evenement'
import { Offre, Recherche } from 'interfaces/favoris'
import {
  getActionsBeneficiaireServerSide,
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

type FicheBeneficiaireParams = { idJeune: string }
type FicheBeneficiaireSearchParams = { page?: string; onglet?: string }

export async function generateMetadata({
  params,
}: {
  params: FicheBeneficiaireParams
}): Promise<Metadata> {
  const { user, accessToken } = await getMandatorySessionServerSide()
  const jeune = await getJeuneDetails(params.idJeune, accessToken)
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
  const userIsFranceTravail = estUserFranceTravail(user)

  const page = searchParams?.page ? parseInt(searchParams.page) : 1

  const [
    conseiller,
    jeune,
    metadonneesFavoris,
    rdvs,
    actions,
    categoriesActions,
  ] = await Promise.all([
    getConseillerServerSide(user, accessToken),
    getJeuneDetails(params.idJeune, accessToken),
    getMetadonneesFavorisJeune(params.idJeune, accessToken),
    userIsFranceTravail
      ? ([] as EvenementListItem[])
      : getRendezVousJeune(
          params.idJeune,
          PeriodeEvenements.FUTURS,
          accessToken
        ),
    userIsFranceTravail
      ? { actions: [], metadonnees: { nombreTotal: 0, nombrePages: 0 } }
      : getActionsBeneficiaireServerSide(params.idJeune, page, accessToken),
    userIsFranceTravail
      ? ([] as SituationNonProfessionnelle[])
      : getSituationsNonProfessionnelles({ avecNonSNP: false }, accessToken),
  ])
  if (!jeune) notFound()

  let sessionsMilo: EvenementListItem[] = []
  let erreurSessions = false
  if (
    peutAccederAuxSessions(conseiller) &&
    conseiller.structureMilo!.id === jeune.structureMilo?.id
  ) {
    try {
      sessionsMilo = await getSessionsMiloBeneficiaire(
        params.idJeune,
        accessToken,
        DateTime.now().startOf('day')
      )
    } catch (e) {
      erreurSessions = true
    }
  }

  let offresPE: Offre[] = []
  let recherchesPE: Recherche[] = []
  if (metadonneesFavoris?.autoriseLePartage) {
    ;[offresPE, recherchesPE] = await Promise.all([
      userIsFranceTravail ? getOffres(params.idJeune, accessToken) : [],
      userIsFranceTravail
        ? getRecherchesSauvegardees(params.idJeune, accessToken)
        : [],
    ])
  }

  const rdvsEtSessionsTriesParDate = [...rdvs]
    .concat(sessionsMilo)
    .sort((event1, event2) =>
      compareDates(DateTime.fromISO(event1.date), DateTime.fromISO(event2.date))
    )

  let onglet: Onglet = 'ACTIONS'
  switch (searchParams?.onglet) {
    case 'agenda':
      onglet = 'AGENDA'
      break
    case 'rdvs':
      onglet = 'RDVS'
      break
    case 'favoris':
      onglet = 'FAVORIS'
      break
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
        offresFT={offresPE}
        recherchesFT={recherchesPE}
        onglet={onglet}
        lectureSeule={jeune.idConseiller !== user.id}
        erreurSessions={erreurSessions}
      />
    </>
  )
}
