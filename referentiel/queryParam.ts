export enum QueryParam {
  // RDV
  creationRdv = 'creationRdv',
  modificationRdv = 'modificationRdv',
  suppressionRdv = 'suppressionRdv',
  // Bénéficiaires
  recuperationBeneficiaires = 'recuperation',
  suppressionBeneficiaire = 'suppression',
  creationBeneficiaire = 'creationBeneficiaire',
  // Action
  creationAction = 'creationAction',
  suppressionAction = 'suppressionAction',
  // Autre
  choixAgence = 'choixAgence',
  envoiMessage = 'envoiMessage',
  modificationIdentifiantPartenaire = 'modificationIdentifiantPartenaire',
}

export enum QueryValue {
  succes = 'succes',
}
