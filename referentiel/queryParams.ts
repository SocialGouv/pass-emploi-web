export interface Alert {
  nom: string
  message: string
}

export const QueryParams = {
  // RDV
  creationRdv: 'creationRdv',
  modificationRdv: 'modificationRdv',
  suppressionRdv: 'suppressionRdv',
  // Bénéficiaires
  recuperationBeneficiaires: 'recuperation',
  suppressionBeneficiaire: 'suppression',
  // Action
  creationAction: 'creationAction',
  suppressionAction: 'suppression',
  // Autre
  choixAgence: 'choixAgence',
  envoiMessage: 'envoiMessage',
}

export const Alerts: Alert[] = [
  { nom: QueryParams.creationRdv, message: 'Le rendez-vous a bien été créé' },
  {
    nom: QueryParams.modificationRdv,
    message: 'Le rendez-vous a bien été modifié',
  },
  {
    nom: QueryParams.suppressionRdv,
    message: 'Le rendez-vous a bien été supprimé',
  },
  {
    nom: QueryParams.recuperationBeneficiaires,
    message: 'Vous avez récupéré vos bénéficiaires avec succès',
  },
  {
    nom: QueryParams.suppressionBeneficiaire,
    message: 'Le compte du bénéficiaire a bien été supprimé',
  },
  { nom: QueryParams.creationAction, message: 'L’action a bien été créée' },
  {
    nom: QueryParams.envoiMessage,
    message:
      'Votre message multi-destinataires a été envoyé en tant que message individuel à chacun des bénéficiaires',
  },
]

export const QueryValues = {
  succes: 'succes',
}
