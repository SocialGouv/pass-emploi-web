import {
  Action,
  CreateurCommentaire,
  EtatAction,
  QualificationAction,
  StatutAction,
} from 'interfaces/action'

type ActionStatusJson = 'not_started' | 'in_progress' | 'done' | 'canceled'
type EtatActionJson = 'A_QUALIFIER' | 'NON_QUALIFIABLE' | 'QUALIFIEE'

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
  etat: EtatActionJson
}

export interface QualificationActionJson {
  libelle: string
  code: string
}

export interface MetadonneesActionsJson {
  nombreTotal: number
  nombreEnCours: number
  nombreTerminees: number
  nombreAnnulees: number
  nombrePasCommencees: number
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
    etat: jsonToEtatAction(json.etat),
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

export function etatActionToJson(etat: EtatAction): EtatActionJson {
  switch (etat) {
    case EtatAction.A_QUALIFIER:
      return 'A_QUALIFIER'
    case EtatAction.NON_QUALIFIABLE:
      return 'NON_QUALIFIABLE'
    case EtatAction.QUALIFIEE:
      return 'QUALIFIEE'
  }
}

export function jsonToEtatAction(jsonEtat: EtatActionJson): EtatAction {
  switch (jsonEtat) {
    case 'A_QUALIFIER':
      return EtatAction.A_QUALIFIER
    case 'NON_QUALIFIABLE':
      return EtatAction.NON_QUALIFIABLE
    case 'QUALIFIEE':
      return EtatAction.QUALIFIEE
  }
}
