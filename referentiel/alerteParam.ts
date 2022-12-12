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
  // Actions
  creationAction = 'creationAction',
  suppressionAction = 'suppressionAction',
  ajoutCommentaireAction = 'ajoutCommentaireAction',
  qualificationSNP = 'qualificationSNP',
  qualificationNonSNP = 'qualificationNonSNP',
  // Listes de diffusion
  creationListeDiffusion = 'creationListeDiffusion',
  modificationListeDiffusion = 'modificationListeDiffusion',
  suppressionListeDiffusion = 'suppressionListeDiffusion',
  // Autre
  choixAgence = 'choixAgence',
  envoiMessage = 'envoiMessage',
  modificationIdentifiantPartenaire = 'modificationIdentifiantPartenaire',
  partageOffre = 'partageOffre',
  suggestionRecherche = 'suggestionRecherche',
}
