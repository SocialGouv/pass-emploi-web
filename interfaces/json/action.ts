import {
  Action,
  CreateurCommentaire,
  EtatQualificationAction,
  QualificationAction,
  StatutAction,
} from 'interfaces/action'

type ActionStatusJson = 'not_started' | 'in_progress' | 'done' | 'canceled'
type EtatQualificationActionJson =
  | 'A_QUALIFIER'
  | 'NON_QUALIFIABLE'
  | 'QUALIFIEE'

export interface ActionJson {
  id: string
  content: string
  comment: string
  creationDate: string
  lastUpdate: string
  status: ActionStatusJson
  creator: string
  creatorType: string
  dateEcheance: string
  dateFinReelle?: string
  qualification?: QualificationActionJson
}

export interface QualificationActionJson {
  libelle: string
  code: string
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
  }
}

export function jsonToAction(json: ActionJson): Action {
  const action: Action = {
    id: json.id,
    content: json.content,
    comment: json.comment,
    creationDate: new Date(json.creationDate).toISOString(),
    lastUpdate: new Date(json.lastUpdate).toISOString(),
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
