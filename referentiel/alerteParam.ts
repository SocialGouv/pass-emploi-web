export enum AlerteParam {
  // Événements
  creationEvenement = 'creationEvenement',
  modificationEvenement = 'modificationEvenement',
  suppressionEvenement = 'suppressionEvenement',
  clotureAC = 'clotureAC',
  // Bénéficiaires
  recuperationBeneficiaires = 'recuperationBeneficiaires',
  suppressionBeneficiaire = 'suppressionBeneficiaire',
  creationBeneficiaire = 'creationBeneficiaire',
  // Action
  creationAction = 'creationAction',
  suppressionAction = 'suppressionAction',
  ajoutCommentaireAction = 'ajoutCommentaireAction',
  qualificationSNP = 'qualificationSNP',
  qualificationNonSNP = 'qualificationNonSNP',
  // Autre
  choixAgence = 'choixAgence',
  envoiMessage = 'envoiMessage',
  modificationIdentifiantPartenaire = 'modificationIdentifiantPartenaire',
  partageOffre = 'partageOffre',
  suggestionRecherche = 'suggestionRecherche',
}
