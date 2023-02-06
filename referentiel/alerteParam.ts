export enum AlerteParam {
  // Événements
  creationRDV = 'creationRDV',
  modificationRDV = 'modificationRDV',
  suppressionRDV = 'suppressionRDV',
  creationAnimationCollective = 'creationAnimationCollective',
  modificationAnimationCollective = 'modificationAnimationCollective',
  suppressionAnimationCollective = 'suppressionAnimationCollective',
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
