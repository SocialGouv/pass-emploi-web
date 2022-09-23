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
  ajoutCommentaireAction = 'ajoutCommentaireAction',
  // Autre
  choixAgence = 'choixAgence',
  envoiMessage = 'envoiMessage',
  modificationIdentifiantPartenaire = 'modificationIdentifiantPartenaire',
  qualificationSNP = 'qualificationSNP',
  qualificationNonSNP = 'qualificationNonSNP',
  partageOffre = 'partageOffre',
}

export enum QueryValue {
  succes = 'succes',
}
