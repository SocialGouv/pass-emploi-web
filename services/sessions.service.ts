import { DateTime } from 'luxon'
import { getSession } from 'next-auth/react'

import { apiGet, apiPatch, apiPost } from 'clients/api.client'
import { AnimationCollective, EvenementListItem } from 'interfaces/evenement'
import { sessionMiloJsonToEvenementListItem } from 'interfaces/json/evenement'
import {
  DetailsSessionJson,
  jsonToStatutSession,
  jsonToTypeSessionMilo,
  SessionMiloBeneficiaireJson,
  SessionMiloBeneficiairesJson,
  SessionMiloJson,
  sessionMiloJsonToAnimationCollective,
} from 'interfaces/json/session'
import { InformationBeneficiaireSession, Session } from 'interfaces/session'
import { minutesEntreDeuxDates, toLongMonthDate } from 'utils/date'
import { ApiError } from 'utils/httpClient'

export type SessionsAClore = {
  id: string
  titre: string
  date: string
  sousTitre?: string
}

export async function getSessionsACloreServerSide(
  idConseiller: string,
  accessToken: string
): Promise<SessionsAClore[]> {
  const optionsText = `filtrerAClore=true`

  const sessionsAClore = await getSessionsMissionLocale(
    idConseiller,
    accessToken,
    optionsText
  )

  return sessionsAClore.map((session) => ({
    id: session.id,
    titre: session.titre,
    sousTitre: session.sousTitre,
    date: toLongMonthDate(session.date),
  }))
}

export async function getSessionsMissionLocaleClientSide(
  idConseiller: string,
  dateDebut: DateTime,
  dateFin: DateTime
): Promise<AnimationCollective[]> {
  const session = await getSession()
  const dateDebutUrlEncoded = encodeURIComponent(dateDebut.toISO())
  const dateFinUrlEncoded = encodeURIComponent(dateFin.toISO())
  const options = `dateDebut=${dateDebutUrlEncoded}&dateFin=${dateFinUrlEncoded}`
  return getSessionsMissionLocale(idConseiller, session!.accessToken, options)
}

export async function getSessionsBeneficiaires(
  idConseiller: string,
  dateDebut: DateTime,
  dateFin: DateTime
): Promise<EvenementListItem[]> {
  const session = await getSession()
  const dateDebutUrlEncoded = encodeURIComponent(dateDebut.toISO())
  const dateFinUrlEncoded = encodeURIComponent(dateFin.toISO())
  const { content: sessionsMiloJson } = await apiGet<
    SessionMiloBeneficiairesJson[]
  >(
    `/conseillers/milo/${idConseiller}/agenda/sessions?dateDebut=${dateDebutUrlEncoded}&dateFin=${dateFinUrlEncoded}`,
    session!.accessToken
  )
  return sessionsMiloJson.map(sessionMiloJsonToEvenementListItem)
}

export async function getDetailsSession(
  idConseiller: string,
  idSession: string,
  accessToken: string
): Promise<Session | undefined> {
  try {
    const { content: sessionJson } = await apiGet<DetailsSessionJson>(
      `/conseillers/milo/${idConseiller}/sessions/${idSession}`,
      accessToken
    )
    return jsonToSession(sessionJson)
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 404) {
      return undefined
    }
    throw e
  }
}

export async function changerInscriptionsSession(
  idSession: string,
  inscriptions?: InformationBeneficiaireSession[]
): Promise<void> {
  const session = await getSession()
  const accessToken = session!.accessToken
  const idConseiller = session!.user.id
  const payload = {
    inscriptions: inscriptions ?? [],
  }

  return modifierInformationsSession(
    idConseiller,
    idSession,
    payload,
    accessToken
  )
}

export async function configurerSession(
  idSession: string,
  configuration: { visibilite: boolean; autoinscription: boolean }
): Promise<void> {
  const session = await getSession()
  const accessToken = session!.accessToken
  const idConseiller = session!.user.id

  return modifierInformationsSession(
    idConseiller,
    idSession,
    configuration,
    accessToken
  )
}

export async function cloreSession(
  idConseiller: string,
  idSession: string,
  emargements: InformationBeneficiaireSession[]
): Promise<void> {
  const session = await getSession()
  const payload = { emargements }
  await apiPost(
    `/conseillers/milo/${idConseiller}/sessions/${idSession}/cloturer`,
    payload,
    session!.accessToken
  )
}

export async function getSessionsMiloBeneficiaire(
  idJeune: string,
  accessToken: string,
  dateDebut: DateTime
): Promise<EvenementListItem[]> {
  const dateDebutUrlEncoded = encodeURIComponent(dateDebut?.toISO())
  try {
    const path = `/jeunes/milo/${idJeune}/sessions?dateDebut=${dateDebutUrlEncoded}&filtrerEstInscrit=true`
    const { content: sessionsMiloJeuneJson } = await apiGet<
      SessionMiloBeneficiaireJson[]
    >(path, accessToken)

    return sessionsMiloJeuneJson.map(
      sessionMiloBeneficiaireJsonToEvenementListItem
    )
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 404) {
      return []
    }
    throw e
  }
}

async function getSessionsMissionLocale(
  idConseiller: string,
  accessToken: string,
  options?: string
): Promise<AnimationCollective[]> {
  try {
    const { content: sessionsMiloJson } = await apiGet<SessionMiloJson[]>(
      `/conseillers/milo/${idConseiller}/sessions${
        options ? '?' + options : ''
      }`,
      accessToken
    )
    return sessionsMiloJson.map(sessionMiloJsonToAnimationCollective)
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 404) {
      return []
    }
    throw e
  }
}

async function modifierInformationsSession(
  idConseiller: string,
  idSession: string,
  payload: {
    estVisible?: boolean
    autoinscription?: boolean
    inscriptions?: InformationBeneficiaireSession[]
  },
  accessToken: string
) {
  return apiPatch(
    `/conseillers/milo/${idConseiller}/sessions/${idSession}`,
    payload,
    accessToken
  )
}

function sessionMiloBeneficiaireJsonToEvenementListItem(
  json: SessionMiloBeneficiaireJson
): EvenementListItem {
  const dateDebut = DateTime.fromISO(json.dateHeureDebut)

  const futPresent = (() => {
    switch (json.inscription) {
      case 'PRESENT':
        return true
      case 'REFUS_JEUNE':
        return false
      case 'INSCRIT':
      default:
        return undefined
    }
  })()

  return {
    id: json.id,
    date: json.dateHeureDebut,
    type: jsonToTypeSessionMilo(json.type),
    duree: minutesEntreDeuxDates(
      dateDebut,
      DateTime.fromISO(json.dateHeureFin)
    ),
    titre: json.nomSession,
    isSession: true,
    futPresent: futPresent,
  }
}

function jsonToSession(json: DetailsSessionJson): Session {
  const session: Session = {
    session: {
      id: json.session.id,
      nom: json.session.nom,
      dateHeureDebut: json.session.dateHeureDebut,
      dateHeureFin: json.session.dateHeureFin,
      lieu: json.session.lieu,
      estVisible: json.session.estVisible,
      autoinscription: json.session.autoinscription,
      statut: jsonToStatutSession(json.session.statut),
    },
    offre: {
      titre: json.offre.nom,
      theme: json.offre.theme,
      type: json.offre.type.label,
    },
    inscriptions: json.inscriptions,
  }

  if (json.offre.description) session.offre.description = json.offre.description
  if (json.offre.nomPartenaire)
    session.offre.partenaire = json.offre.nomPartenaire
  if (json.session.nbPlacesDisponibles !== undefined)
    session.session.nbPlacesDisponibles = json.session.nbPlacesDisponibles

  if (json.session.dateMaxInscription)
    session.session.dateMaxInscription = json.session.dateMaxInscription
  if (json.session.animateur) session.session.animateur = json.session.animateur
  if (json.session.commentaire)
    session.session.commentaire = json.session.commentaire

  return session
}
