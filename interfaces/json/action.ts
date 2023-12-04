import { DateTime } from 'luxon'

import {
  Action,
  ActionPilotage,
  CreateurCommentaire,
  EtatQualificationAction,
  QualificationAction,
  StatutAction,
} from 'interfaces/action'
import { EntreeAgenda } from 'interfaces/agenda'
import { toShortDate } from 'utils/date'

type ActionStatusJson = 'not_started' | 'in_progress' | 'done' | 'canceled'
type EtatQualificationActionJson =
  | 'A_QUALIFIER'
  | 'NON_QUALIFIABLE'
  | 'QUALIFIEE'

export interface ActionJson {
  id: string
  content: string
  comment: string
  creationDate: string // 'EEE, d MMM yyyy HH:mm:ss z: Sat, 21 Feb 2022 14:50:46 UTC
  lastUpdate: string // 'EEE, d MMM yyyy HH:mm:ss z: Sat, 21 Feb 2022 14:50:46 UTC
  status: ActionStatusJson
  creator: string
  creatorType: string
  dateEcheance: string
  dateFinReelle?: string
  qualification?: QualificationActionJson
}

export interface ActionPilotageJson {
  id: string
  titre: string
  jeune: {
    id: string
    nom: string
    prenom: string
  }
  dateFinReelle: string
}

export interface QualificationActionJson {
  libelle: string
  code: string
  heures?: number
}

export interface MetadonneesActionsJson {
  nombreTotal: number
  nombrePasCommencees: number
  nombreEnCours: number
  nombreTerminees: number
  nombreAnnulees: number
  nombreNonQualifiables: number
  nombreAQualifier: number
  nombreQualifiees: number
  nombreActionsParPage: number
}

export interface ActionsCountJson {
  jeuneId: string
  todoActionsCount: number
  inProgressActionsCount: number
}

export interface CommentaireJson {
  id: string
  idAction: string
  date: string
  createur: CreateurCommentaire
  message: string
}

export const CODE_QUALIFICATION_NON_SNP = 'NON_SNP'

export function jsonToQualification(
  qualificationJson: QualificationActionJson
): QualificationAction {
  return {
    libelle: qualificationJson.libelle,
    isSituationNonProfessionnelle:
      qualificationJson.code !== CODE_QUALIFICATION_NON_SNP,
    estQualifiee: Boolean(qualificationJson.heures),
  }
}

export function jsonToAction(json: ActionJson): Action {
  const legacyFormat = 'EEE, d MMM yyyy HH:mm:ss z'
  const action: Action = {
    id: json.id,
    content: json.content,
    comment: json.comment,
    creationDate: DateTime.fromFormat(json.creationDate, legacyFormat).toISO(),
    lastUpdate: DateTime.fromFormat(json.lastUpdate, legacyFormat).toISO(),
    status: jsonToActionStatus(json.status),
    creator: json.creator,
    creatorType: json.creatorType,
    dateEcheance: json.dateEcheance,
  }

  if (json.dateFinReelle) {
    action.dateFinReelle = json.dateFinReelle
  }

  if (json.qualification) {
    action.qualification = jsonToQualification(json.qualification)
  }

  return action
}

export function jsonToActionPilotage(
  action: ActionPilotageJson
): ActionPilotage {
  return {
    id: action.id,
    titre: action.titre,
    beneficiaire: {
      id: action.jeune.id,
      nom: action.jeune.nom,
      prenom: action.jeune.prenom,
    },
    dateFinReelle: toShortDate(action.dateFinReelle),
  }
}

export function actionJsonToEntree(action: ActionJson): EntreeAgenda {
  return {
    id: action.id,
    date: DateTime.fromISO(action.dateEcheance),
    type: 'action',
    titre: action.content,
    statut: jsonToActionStatus(action.status),
  }
}

function jsonToActionStatus(jsonStatus: ActionStatusJson): StatutAction {
  switch (jsonStatus) {
    case 'in_progress':
      return StatutAction.Commencee
    case 'done':
      return StatutAction.Terminee
    case 'canceled':
      return StatutAction.Annulee
    case 'not_started':
      return StatutAction.ARealiser
    default:
      console.warn(
        `Statut d'action ${jsonStatus} incorrect, traité comme ARealiser`
      )
      return StatutAction.ARealiser
  }
}

export function actionStatusToJson(status: StatutAction): ActionStatusJson {
  switch (status) {
    case StatutAction.ARealiser:
      return 'not_started'
    case StatutAction.Commencee:
      return 'in_progress'
    case StatutAction.Terminee:
      return 'done'
    case StatutAction.Annulee:
      return 'canceled'
  }
}

export function etatQualificationActionToJson(
  etat: EtatQualificationAction
): EtatQualificationActionJson {
  switch (etat) {
    case EtatQualificationAction.AQualifier:
      return 'A_QUALIFIER'
    case EtatQualificationAction.NonQualifiable:
      return 'NON_QUALIFIABLE'
    case EtatQualificationAction.Qualifiee:
      return 'QUALIFIEE'
  }
}
