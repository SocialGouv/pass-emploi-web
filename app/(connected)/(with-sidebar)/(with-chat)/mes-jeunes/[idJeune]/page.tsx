import { DateTime } from 'luxon'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import FicheBeneficiairePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiairePage'
import {
  FicheMiloProps,
  FichePasMiloProps,
  Onglet,
  valeursOngletsMilo,
  valeursOngletsPasMilo,
} from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiaireProps'
import { PageFilArianePortal } from 'components/PageNavigationPortals'
import { MetadonneesFavoris } from 'interfaces/beneficiaire'
import { Conseiller, peutAccederAuxSessions } from 'interfaces/conseiller'
import { EvenementListItem, PeriodeEvenements } from 'interfaces/evenement'
import { estConseilDepartemental, estMilo } from 'interfaces/structure'
import { getSituationsNonProfessionnelles } from 'services/actions.service'
import {
  getConseillersDuJeuneServerSide,
  getDemarchesBeneficiaire,
  getJeuneDetails,
  getMetadonneesFavorisJeune,
} from 'services/beneficiaires.service'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getRendezVousJeune } from 'services/evenements.service'
import { getOffres } from 'services/favoris.service'
import { getSessionsMiloBeneficiaire } from 'services/sessions.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'
import { compareDates } from 'utils/date'

type FicheBeneficiaireParams = Promise<{ idJeune: string }>
type FicheBeneficiaireSearchParams = Promise<{
  onglet?: string
  debut?: string
}>
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

  const [conseiller, beneficiaire, metadonneesFavoris, historiqueConseillers] =
    await Promise.all([
      getConseillerServerSide(user, accessToken),
      getJeuneDetails(idJeune, accessToken),
      getMetadonneesFavorisJeune(idJeune, accessToken),
      getConseillersDuJeuneServerSide(idJeune, accessToken),
    ])
  if (!beneficiaire) notFound()

  let favorisOffres
  if (metadonneesFavoris?.autoriseLePartage) {
    favorisOffres = await getOffres(beneficiaire.id, accessToken)
  }

  const { onglet, debut } = (await searchParams) ?? {}
  const ongletInitial = getOngletInitial(onglet, conseiller, metadonneesFavoris)
  let debutSemaineInitiale
  if (debut)
    try {
      const dateValid = DateTime.fromISO(debut)
      debutSemaineInitiale = dateValid.toISODate()
    } catch {}

  const props = {
    beneficiaire,
    ongletInitial,
    historiqueConseillers,
    metadonneesFavoris,
    favorisOffres,
    debutSemaineInitiale,
  }

  return (
    <>
      <PageFilArianePortal />

      {estMilo(conseiller.structure) &&
        (await renderFicheMilo(conseiller, accessToken, props))}

      {!estMilo(conseiller.structure) &&
        (await renderFichePasMilo(conseiller, accessToken, props))}
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
  accessToken: string,
  props: Pick<
    FicheMiloProps,
    | 'beneficiaire'
    | 'ongletInitial'
    | 'historiqueConseillers'
    | 'metadonneesFavoris'
    | 'favorisOffres'
    | 'debutSemaineInitiale'
  >
): Promise<ReactElement> {
  const [rdvs, categoriesActions] = await Promise.all([
    getRendezVousJeune(
      props.beneficiaire.id,
      PeriodeEvenements.FUTURS,
      accessToken
    ),
    getSituationsNonProfessionnelles({ avecNonSNP: false }, accessToken),
  ])

  let sessionsMilo: EvenementListItem[] = []
  let erreurSessions = false
  if (
    peutAccederAuxSessions(conseiller) &&
    conseiller.structureMilo!.id === props.beneficiaire.structureMilo?.id
  ) {
    try {
      sessionsMilo = await getSessionsMiloBeneficiaire(
        props.beneficiaire.id,
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
      {...props}
      estMilo={true}
      rdvs={rdvsEtSessionsTriesParDate}
      categoriesActions={categoriesActions}
      erreurSessions={erreurSessions}
    />
  )
}

async function renderFichePasMilo(
  conseiller: Conseiller,
  accessToken: string,
  props: Pick<
    FichePasMiloProps,
    | 'beneficiaire'
    | 'ongletInitial'
    | 'historiqueConseillers'
    | 'metadonneesFavoris'
    | 'favorisOffres'
    | 'debutSemaineInitiale'
  >
): Promise<ReactElement> {
  const trenteJoursAvant = DateTime.now().minus({ day: 30 }).startOf('day')
  const demarches = estConseilDepartemental(conseiller.structure)
    ? await getDemarchesBeneficiaire(
        props.beneficiaire.id,
        trenteJoursAvant,
        conseiller.id,
        accessToken
      )
    : undefined

  return (
    <FicheBeneficiairePage {...props} estMilo={false} demarches={demarches} />
  )
}
