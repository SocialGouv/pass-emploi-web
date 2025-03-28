import { DateTime } from 'luxon'

import {
  Action,
  ActionPilotage,
  estTermine,
  QualificationAction,
  StatutAction,
} from 'interfaces/action'
import { EntreeAgenda } from 'interfaces/agenda'

export interface ActionJson {
  id: string
  content: string
  comment: string
  creationDate: string // 'EEE, d MMM yyyy HH:mm:ss z: Sat, 21 Feb 2022 14:50:46 UTC
  lastUpdate: string // 'EEE, d MMM yyyy HH:mm:ss z: Sat, 21 Feb 2022 14:50:46 UTC
  status: string
  etat: string
  creator: string
  creatorType: string
  dateEcheance: string
  dateFinReelle?: string
  qualification?: QualificationActionJson
  jeune: {
    id: string
    lastName: string
    firstName: string
    idConseiller: string
    dispositif: string
  }
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
  categorie?: {
    code: string
    libelle: string
  }
}

export interface QualificationActionJson {
  libelle: string
  code: string
  heures?: number
}

export interface CompteursPortefeuilleJson {
  idBeneficiaire: string
  actions: number
  rdvs: number
  sessions: number
}

export type ActionFormData = {
  codeCategorie: string
  titre: string
  dateEcheance: string
  statut: StatutAction
  description?: string
  dateFinReelle?: string
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
    titre: json.content,
    comment: json.comment,
    creationDate: DateTime.fromFormat(json.creationDate, legacyFormat).toISO(),
    lastUpdate: DateTime.fromFormat(json.lastUpdate, legacyFormat).toISO(),
    status: jsonToActionStatus(json),
    creator: json.creator,
    creatorType: json.creatorType,
    dateEcheance: json.dateEcheance,
    beneficiaire: {
      id: json.jeune.id,
      prenom: json.jeune.firstName,
      nom: json.jeune.lastName,
      dispositif: json.jeune.dispositif,
      idConseiller: json.jeune.idConseiller,
    },
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
  const actionPilotage: ActionPilotage = {
    id: action.id,
    titre: action.titre,
    beneficiaire: {
      id: action.jeune.id,
      nom: action.jeune.nom,
      prenom: action.jeune.prenom,
    },
    dateFinReelle: action.dateFinReelle,
  }

  if (action.categorie)
    actionPilotage.categorie = {
      code: action.categorie.code,
      libelle: action.categorie.libelle,
    }

  return actionPilotage
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

export function jsonToActionStatus({ status, etat }: ActionJson): StatutAction {
  switch (status) {
    case 'not_started':
    case 'in_progress':
      return StatutAction.AFaire
    case 'done':
      if (etat === 'A_QUALIFIER') return StatutAction.TermineeAQualifier
      if (etat === 'QUALIFIEE') return StatutAction.TermineeQualifiee
      return StatutAction.Terminee
    case 'canceled':
      return StatutAction.Annulee
    default:
      console.warn(`Statut d'action ${status} incorrect, traité comme EnCours`)
      return StatutAction.AFaire
  }
}

export function actionStatusToJson(statut: StatutAction): string {
  if (estTermine(statut)) return 'done'
  return 'in_progress'
}

export function statutActionToFiltres(status: StatutAction): string {
  switch (status) {
    case StatutAction.AFaire:
      return '&statuts=in_progress&statuts=not_started'
    case StatutAction.Terminee:
      return '&statuts=done'
    case StatutAction.Annulee:
      return '&statuts=canceled'
    case StatutAction.TermineeAQualifier:
      return '&statuts=done&etats=A_QUALIFIER'
    case StatutAction.TermineeQualifiee:
      return '&statuts=done&etats=QUALIFIEE'
  }
}
