import { DateTime } from 'luxon'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import FicheBeneficiairePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiairePage'
import {
  Onglet,
  OngletMilo,
  OngletPasMilo,
  valeursOngletsMilo,
  valeursOngletsPasMilo,
} from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/rendez-vous-passes/FicheBeneficiaireProps'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import { DetailBeneficiaire, MetadonneesFavoris } from 'interfaces/beneficiaire'
import { Conseiller, peutAccederAuxSessions } from 'interfaces/conseiller'
import { EvenementListItem, PeriodeEvenements } from 'interfaces/evenement'
import { Offre } from 'interfaces/favoris'
import { estConseilDepartemental, estMilo } from 'interfaces/structure'
import {
  getActionsBeneficiaireServerSide,
  getSituationsNonProfessionnelles,
} from 'services/actions.service'
import {
  getDemarchesBeneficiaire,
  getJeuneDetails,
  getMetadonneesFavorisJeune,
} from 'services/beneficiaires.service'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getRendezVousJeune } from 'services/evenements.service'
import { getOffres, getRecherchesSauvegardees } from 'services/favoris.service'
import { getSessionsMiloBeneficiaire } from 'services/sessions.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'
import { compareDates } from 'utils/date'

type FicheBeneficiaireParams = Promise<{ idJeune: string }>
type FicheBeneficiaireSearchParams = Promise<{ page?: string; onglet?: string }>
type RouteProps = {
  params: FicheBeneficiaireParams
  searchParams?: FicheBeneficiaireSearchParams
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { user, accessToken } = await getMandatorySessionServerSide()
  const { idJeune } = await params
  const jeune = await getJeuneDetails(idJeune, accessToken)
  if (!jeune) notFound()

  if (jeune.idConseiller !== user.id) {
    return { title: `Établissement - ${jeune.prenom} ${jeune.nom}` }
  }
  return { title: `Portefeuille - ${jeune.prenom} ${jeune.nom}` }
}
export default async function FicheBeneficiaire({
  params,
  searchParams,
}: RouteProps) {
  const { user, accessToken } = await getMandatorySessionServerSide()
  const { idJeune } = await params

  const [conseiller, beneficiaire, metadonneesFavoris] = await Promise.all([
    getConseillerServerSide(user, accessToken),
    getJeuneDetails(idJeune, accessToken),
    getMetadonneesFavorisJeune(idJeune, accessToken),
  ])
  if (!beneficiaire) notFound()

  let offres
  if (metadonneesFavoris?.autoriseLePartage) {
    offres = await getOffres(beneficiaire.id, accessToken)
  }

  const { page, onglet } = (await searchParams) ?? {}
  const ongletInitial = getOngletInitial(onglet, conseiller, metadonneesFavoris)

  return (
    <>
      <PageFilArianePortal />
      <PageHeaderPortal header={`${beneficiaire.prenom} ${beneficiaire.nom}`} />

      {estMilo(conseiller.structure) &&
        (await renderFicheMilo(
          conseiller,
          beneficiaire,
          accessToken,
          page ? parseInt(page) : 1,
          ongletInitial,
          metadonneesFavoris,
          offres
        ))}

      {!estMilo(conseiller.structure) &&
        (await renderFichePasMilo(
          conseiller,
          beneficiaire,
          accessToken,
          ongletInitial,
          metadonneesFavoris,
          offres
        ))}
    </>
  )
}

function getOngletInitial(
  searchParam: string | undefined,
  conseiller: Conseiller,
  metadonneesFavoris?: MetadonneesFavoris
): Onglet {
  if (
    searchParam &&
    [...valeursOngletsMilo, ...valeursOngletsPasMilo].includes(searchParam)
  )
    return searchParam

  if (estMilo(conseiller.structure)) return 'actions'
  if (estConseilDepartemental(conseiller.structure)) return 'demarches'
  if (metadonneesFavoris?.autoriseLePartage) return 'offres'
  return 'favoris'
}

async function renderFicheMilo(
  conseiller: Conseiller,
  beneficiaire: DetailBeneficiaire,
  accessToken: string,
  page: number,
  ongletInitial: OngletMilo,
  metadonneesFavoris?: MetadonneesFavoris,
  offres?: Offre[]
): Promise<ReactElement> {
  const [rdvs, actions, categoriesActions] = await Promise.all([
    getRendezVousJeune(beneficiaire.id, PeriodeEvenements.FUTURS, accessToken),
    getActionsBeneficiaireServerSide(beneficiaire.id, page, accessToken),
    getSituationsNonProfessionnelles({ avecNonSNP: false }, accessToken),
  ])

  let sessionsMilo: EvenementListItem[] = []
  let erreurSessions = false
  if (
    peutAccederAuxSessions(conseiller) &&
    conseiller.structureMilo!.id === beneficiaire.structureMilo?.id
  ) {
    try {
      sessionsMilo = await getSessionsMiloBeneficiaire(
        beneficiaire.id,
        accessToken,
        DateTime.now().startOf('day')
      )
    } catch {
      erreurSessions = true
    }
  }

  const rdvsEtSessionsTriesParDate = [...rdvs]
    .concat(sessionsMilo)
    .sort((event1, event2) =>
      compareDates(DateTime.fromISO(event1.date), DateTime.fromISO(event2.date))
    )

  return (
    <FicheBeneficiairePage
      beneficiaire={beneficiaire}
      estMilo={true}
      metadonneesFavoris={metadonneesFavoris}
      favorisOffres={offres}
      rdvs={rdvsEtSessionsTriesParDate}
      actionsInitiales={{ ...actions, page }}
      categoriesActions={categoriesActions}
      ongletInitial={ongletInitial}
      lectureSeule={beneficiaire.idConseiller !== conseiller.id}
      erreurSessions={erreurSessions}
    />
  )
}

async function renderFichePasMilo(
  conseiller: Conseiller,
  beneficiaire: DetailBeneficiaire,
  accessToken: string,
  ongletInitial: OngletPasMilo,
  metadonneesFavoris?: MetadonneesFavoris,
  offres?: Offre[]
): Promise<ReactElement> {
  const trenteJoursAvant = DateTime.now().minus({ day: 30 }).startOf('day')
  const demarches = estConseilDepartemental(conseiller.structure)
    ? await getDemarchesBeneficiaire(
        beneficiaire.id,
        trenteJoursAvant,
        conseiller.id,
        accessToken
      )
    : undefined

  let recherches
  if (metadonneesFavoris?.autoriseLePartage) {
    recherches = await getRecherchesSauvegardees(beneficiaire.id, accessToken)
  }

  return (
    <FicheBeneficiairePage
      beneficiaire={beneficiaire}
      estMilo={false}
      metadonneesFavoris={metadonneesFavoris}
      favorisOffres={offres}
      favorisRecherches={recherches}
      ongletInitial={ongletInitial}
      lectureSeule={beneficiaire.idConseiller !== conseiller.id}
      demarches={demarches}
    />
  )
}
