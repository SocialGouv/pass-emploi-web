import { DateTime } from 'luxon'

import {
  Action,
  ActionPilotage,
  CreateurCommentaire,
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
    code: qualificationJson.code,
    isSituationNonProfessionnelle:
      qualificationJson.code !== CODE_QUALIFICATION_NON_SNP,
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
    status: jsonToActionStatus(json),
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
    statut: jsonToActionStatus(action),
  }
}

function jsonToActionStatus({
  status,
  qualification,
}: ActionJson): StatutAction {
  switch (status) {
    case 'not_started':
    case 'in_progress':
      return StatutAction.EnCours
    case 'done':
      if (qualification?.heures !== undefined) return StatutAction.Qualifiee
      return StatutAction.Terminee
    case 'canceled':
      return StatutAction.Annulee
    default:
      console.warn(`Statut d'action ${status} incorrect, traité comme EnCours`)
      return StatutAction.EnCours
  }
}

export function actionStatusToJson(status: StatutAction): ActionStatusJson {
  switch (status) {
    case StatutAction.EnCours:
      return 'in_progress'
    case StatutAction.Terminee:
    case StatutAction.Qualifiee:
      return 'done'
    case StatutAction.Annulee:
      return 'canceled'
    default:
      return 'in_progress'
  }
}

export function actionStatusToFiltre(status: StatutAction): string {
  switch (status) {
    case StatutAction.EnCours:
      return '&statuts=in_progress&statuts=not_started'
    case StatutAction.Terminee:
      return '&statuts=done&etats=A_QUALIFIER'
    case StatutAction.Annulee:
      return '&statuts=canceled'
    case StatutAction.Qualifiee:
      return '&statuts=done&etats=QUALIFIEE'
  }
}
