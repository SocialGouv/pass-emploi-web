import { DateTime } from 'luxon'

import { apiDelete, apiGet, apiPost } from 'clients/api.client'
import {
  desCategories,
  desCategoriesAvecNONSNP,
  uneAction,
  uneActionJson,
  uneListeDActions,
  uneListeDActionsAQualifier,
  uneListeDActionsAQualifierJson,
  uneListeDActionsJson,
} from 'fixtures/action'
import { QualificationAction, StatutAction } from 'interfaces/action'
import { CODE_QUALIFICATION_NON_SNP } from 'interfaces/json/action'
import {
  creerAction,
  deleteAction,
  getAction,
  getActionsAQualifierClientSide,
  getActionsAQualifierServerSide,
  getActionsBeneficiaireClientSide,
  getActionsBeneficiaireServerSide,
  getSituationsNonProfessionnelles,
  qualifier,
  qualifierActions,
  recupereCompteursBeneficiairesPortefeuilleMilo,
} from 'services/actions.service'
import { ApiError } from 'utils/httpClient'

jest.mock('clients/api.client')

describe('ActionsApiService', () => {
  describe('.getAction', () => {
    it('renvoie une action non commencée', async () => {
      // GIVEN
      const action = uneAction({ status: StatutAction.AFaire })
      ;(apiGet as jest.Mock).mockImplementation((url: string) => {
        if (url.includes(action.id))
          return {
            content: {
              ...uneActionJson({ id: action.id, status: 'not_started' }),
              jeune: {
                id: 'beneficiaire-1',
                firstName: 'Nadia',
                lastName: 'Sanfamiye',
                idConseiller: 'id-conseiller',
              },
            },
          }
      })

      // WHEN
      const actual = await getAction(action.id, 'accessToken')

      // THEN
      expect(actual).toStrictEqual({
        action,
        jeune: {
          id: 'beneficiaire-1',
          prenom: 'Nadia',
          nom: 'Sanfamiye',
          idConseiller: 'id-conseiller',
        },
      })
    })

    it('renvoie une action commencée', async () => {
      // GIVEN
      const action = uneAction({ status: StatutAction.AFaire })
      ;(apiGet as jest.Mock).mockImplementation((url: string) => {
        if (url.includes(action.id))
          return {
            content: {
              ...uneActionJson({ id: action.id, status: 'in_progress' }),
              jeune: {
                id: 'beneficiaire-1',
                firstName: 'Nadia',
                lastName: 'Sanfamiye',
                idConseiller: 'id-conseiller',
              },
            },
          }
      })

      // WHEN
      const actual = await getAction(action.id, 'accessToken')

      // THEN
      expect(actual).toStrictEqual({
        action,
        jeune: {
          id: 'beneficiaire-1',
          prenom: 'Nadia',
          nom: 'Sanfamiye',
          idConseiller: 'id-conseiller',
        },
      })
    })

    it('renvoie une action terminée', async () => {
      // GIVEN
      const action = uneAction({ status: StatutAction.Terminee })
      ;(apiGet as jest.Mock).mockImplementation((url: string) => {
        if (url === `/actions/${action.id}`)
          return {
            content: {
              ...uneActionJson({ id: action.id, status: 'done' }),
              jeune: {
                id: 'beneficiaire-1',
                firstName: 'Nadia',
                lastName: 'Sanfamiye',
                idConseiller: 'id-conseiller',
              },
            },
          }
      })

      // WHEN
      const actual = await getAction(action.id, 'accessToken')

      // THEN
      expect(actual).toStrictEqual({
        action,
        jeune: {
          id: 'beneficiaire-1',
          prenom: 'Nadia',
          nom: 'Sanfamiye',
          idConseiller: 'id-conseiller',
        },
      })
    })

    it('renvoie une action annulée', async () => {
      // GIVEN
      const action = uneAction({ status: StatutAction.Annulee })
      ;(apiGet as jest.Mock).mockImplementation((url: string) => {
        if (url === `/actions/${action.id}`)
          return {
            content: {
              ...uneActionJson({ id: action.id, status: 'canceled' }),
              jeune: {
                id: 'beneficiaire-1',
                firstName: 'Nadia',
                lastName: 'Sanfamiye',
                idConseiller: 'id-conseiller',
              },
            },
          }
      })

      // WHEN
      const actual = await getAction(action.id, 'accessToken')

      // THEN
      expect(actual).toStrictEqual({
        action,
        jeune: {
          id: 'beneficiaire-1',
          prenom: 'Nadia',
          nom: 'Sanfamiye',
          idConseiller: 'id-conseiller',
        },
      })
    })

    it('renvoie une action qualifiée en SNP', async () => {
      // GIVEN
      const action = uneAction({
        status: StatutAction.Qualifiee,
        qualification: {
          libelle: 'Santé',
          code: 'SANTE',
          isSituationNonProfessionnelle: true,
        },
      })
      ;(apiGet as jest.Mock).mockImplementation((url: string) => {
        if (url === `/actions/${action.id}`)
          return {
            content: {
              ...uneActionJson({
                id: action.id,
                status: 'done',
                qualification: {
                  libelle: 'Santé',
                  code: 'SANTE',
                  heures: 5,
                },
              }),
              jeune: {
                id: 'beneficiaire-1',
                firstName: 'Nadia',
                lastName: 'Sanfamiye',
                idConseiller: 'id-conseiller',
              },
            },
          }
      })

      // WHEN
      const actual = await getAction(action.id, 'accessToken')

      // THEN
      expect(actual).toStrictEqual({
        action,
        jeune: {
          id: 'beneficiaire-1',
          prenom: 'Nadia',
          nom: 'Sanfamiye',
          idConseiller: 'id-conseiller',
        },
      })
    })

    it('renvoie une action qualifiée en NON SNP', async () => {
      // GIVEN
      const action = uneAction({
        status: StatutAction.Qualifiee,
        qualification: {
          libelle: 'Situation pas non professionnelle',
          code: 'NON_SNP',
          isSituationNonProfessionnelle: false,
        },
      })
      ;(apiGet as jest.Mock).mockImplementation((url: string) => {
        if (url === `/actions/${action.id}`)
          return {
            content: {
              ...uneActionJson({
                id: action.id,
                status: 'done',
                qualification: {
                  libelle: 'Situation pas non professionnelle',
                  code: 'NON_SNP',
                  heures: 5,
                },
              }),
              jeune: {
                id: 'beneficiaire-1',
                firstName: 'Nadia',
                lastName: 'Sanfamiye',
                idConseiller: 'id-conseiller',
              },
            },
          }
      })

      // WHEN
      const actual = await getAction(action.id, 'accessToken')

      // THEN
      expect(actual).toStrictEqual({
        action,
        jeune: {
          id: 'beneficiaire-1',
          prenom: 'Nadia',
          nom: 'Sanfamiye',
          idConseiller: 'id-conseiller',
        },
      })
    })

    it('ne renvoie pas une action inexistante', async () => {
      // GIVEN
      ;(apiGet as jest.Mock).mockRejectedValue(
        new ApiError(404, 'Action non trouvée')
      )

      // WHEN
      const actual = await getAction('action-id', 'accessToken')

      // THEN
      expect(actual).toEqual(undefined)
    })
  })

  describe('.getActionsBeneficiaireClientSide', () => {
    it('renvoie les actions du jeune', async () => {
      // GIVEN
      const actions = uneListeDActions()
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: {
          actions: uneListeDActionsJson(),
          metadonnees: {
            nombreTotal: 82,
            nombreFiltrees: 82,
            nombreActionsParPage: 10,
          },
        },
      })

      // WHEN
      const actual = await getActionsBeneficiaireClientSide('whatever', {
        tri: 'date_decroissante',
        page: 1,
        filtres: { statuts: [], categories: [] },
      })

      // THEN
      expect(apiGet).toHaveBeenCalledWith(
        '/v2/jeunes/whatever/actions?page=1&tri=date_decroissante',
        'accessToken'
      )
      expect(actual).toStrictEqual({
        actions,
        metadonnees: { nombrePages: 9, nombreTotal: 82 },
      })
    })

    it('parse le paramètre pour filtrer les actions par statut et compte le nombre de pages', async () => {
      // GIVEN
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: {
          actions: uneListeDActionsJson(),
          metadonnees: {
            nombreTotal: 82,
            nombreFiltrees: 51,
            nombreActionsParPage: 10,
          },
        },
      })

      // WHEN
      const actual = await getActionsBeneficiaireClientSide('whatever', {
        tri: 'date_decroissante',
        page: 1,
        filtres: { statuts: [StatutAction.AFaire], categories: [] },
      })

      // THEN
      expect(apiGet).toHaveBeenCalledWith(
        '/v2/jeunes/whatever/actions?page=1&tri=date_decroissante&statuts=in_progress&statuts=not_started',
        'accessToken'
      )
      expect(actual).toStrictEqual({
        actions: expect.arrayContaining([]),
        metadonnees: {
          nombreTotal: 82,
          nombrePages: 6,
        },
      })
    })

    it('parse le paramètre pour filtrer les actions par état de qualification et compte le nombre de pages', async () => {
      // GIVEN
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: {
          actions: uneListeDActionsJson(),
          metadonnees: {
            nombreTotal: 82,
            nombreFiltrees: 18,
            nombreActionsParPage: 10,
          },
        },
      })

      // WHEN
      const actual = await getActionsBeneficiaireClientSide('whatever', {
        tri: 'date_decroissante',
        page: 1,
        filtres: {
          statuts: [StatutAction.Qualifiee],
          categories: [],
        },
      })

      // THEN
      expect(apiGet).toHaveBeenCalledWith(
        '/v2/jeunes/whatever/actions?page=1&tri=date_decroissante&statuts=done&etats=QUALIFIEE',
        'accessToken'
      )
      expect(actual).toStrictEqual({
        actions: expect.arrayContaining([]),
        metadonnees: {
          nombreTotal: 82,
          nombrePages: 2,
        },
      })
    })

    it('parse le paramètre pour filtrer les actions par catégorie et compte le nombre de pages', async () => {
      // GIVEN
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: {
          actions: uneListeDActionsJson(),
          metadonnees: {
            nombreTotal: 82,
            nombreFiltrees: 21,
            nombreActionsParPage: 10,
          },
        },
      })

      // WHEN
      const actual = await getActionsBeneficiaireClientSide('whatever', {
        tri: 'date_decroissante',
        page: 1,
        filtres: {
          statuts: [],
          categories: ['SANTE'],
        },
      })

      // THEN
      expect(apiGet).toHaveBeenCalledWith(
        '/v2/jeunes/whatever/actions?page=1&tri=date_decroissante&categories=SANTE',
        'accessToken'
      )
      expect(actual).toStrictEqual({
        actions: expect.arrayContaining([]),
        metadonnees: {
          nombreTotal: 82,
          nombrePages: 3,
        },
      })
    })
  })

  describe('.getActionsBeneficiaireServerSide', () => {
    it('renvoie les actions du jeune', async () => {
      // GIVEN
      const actions = uneListeDActions()
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: {
          actions: uneListeDActionsJson(),
          metadonnees: {
            nombreTotal: 82,
            nombreFiltrees: 82,
            nombreActionsParPage: 10,
          },
        },
      })

      // WHEN
      const actual = await getActionsBeneficiaireServerSide(
        'whatever',
        1,
        'accessToken'
      )

      // THEN
      expect(apiGet).toHaveBeenCalledWith(
        '/v2/jeunes/whatever/actions?page=1&tri=date_echeance_decroissante',
        'accessToken'
      )
      expect(actual).toStrictEqual({
        actions,
        metadonnees: { nombrePages: 9, nombreTotal: 82 },
      })
    })
  })

  describe('.getActionsAQualifierClientSide', () => {
    it('renvoie les actions du conseiller à qualifier triées par bénéficiaire', async () => {
      // GIVEN
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: {
          resultats: uneListeDActionsAQualifierJson(),
          pagination: { total: 5, limit: 10 },
        },
      })

      // WHEN
      const actual = await getActionsAQualifierClientSide('whatever', {
        page: 1,
        tri: 'BENEFICIAIRE_ALPHABETIQUE',
        filtres: ['SANTE', 'EMPLOI'],
      })

      // THEN
      expect(apiGet).toHaveBeenCalledWith(
        '/v2/conseillers/whatever/actions?page=1&aQualifier=true&tri=BENEFICIAIRE_ALPHABETIQUE&codesCategories=SANTE&codesCategories=EMPLOI',
        'accessToken'
      )
      expect(actual).toStrictEqual({
        actions: uneListeDActionsAQualifier(),
        metadonnees: { nombrePages: 1, nombreTotal: 5 },
      })
    })

    it('renvoie les actions du conseiller à qualifier triées par date de réalisation', async () => {
      // GIVEN
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: {
          resultats: uneListeDActionsAQualifierJson(),
          pagination: { total: 5, limit: 10 },
        },
      })

      // WHEN
      const actual = await getActionsAQualifierClientSide('whatever', {
        page: 1,
        tri: 'REALISATION_ANTICHRONOLOGIQUE',
        filtres: ['SANTE', 'EMPLOI'],
      })

      // THEN
      expect(apiGet).toHaveBeenCalledWith(
        '/v2/conseillers/whatever/actions?page=1&aQualifier=true&tri=REALISATION_ANTICHRONOLOGIQUE&codesCategories=SANTE&codesCategories=EMPLOI',
        'accessToken'
      )
      expect(actual).toStrictEqual({
        actions: uneListeDActionsAQualifier(),
        metadonnees: { nombrePages: 1, nombreTotal: 5 },
      })
    })
  })

  describe('.getActionsAQualifierServerSide', () => {
    it('renvoie les actions du conseiller à qualifier', async () => {
      // GIVEN
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: {
          resultats: uneListeDActionsAQualifierJson(),
          pagination: { total: 5, limit: 10 },
        },
      })

      // WHEN
      const actual = await getActionsAQualifierServerSide(
        'whatever',
        'accessToken'
      )

      // THEN
      expect(apiGet).toHaveBeenCalledWith(
        '/v2/conseillers/whatever/actions?page=1&aQualifier=true&tri=REALISATION_CHRONOLOGIQUE',
        'accessToken'
      )
      expect(actual).toStrictEqual({
        actions: uneListeDActionsAQualifier(),
        metadonnees: { nombrePages: 1, nombreTotal: 5 },
      })
    })
  })

  describe('.createAction', () => {
    it('crée une nouvelle action', async () => {
      // GIVEN
      // WHEN
      await creerAction(
        {
          codeCategorie: 'CODE',
          titre: 'content',
          description: 'comment',
          dateEcheance: '2022-07-30',
          statut: StatutAction.AFaire,
        },
        'id-jeune'
      )

      // THEN
      expect(apiPost).toHaveBeenCalledWith(
        '/conseillers/idConseiller/jeunes/id-jeune/action',
        {
          codeQualification: 'CODE',
          content: 'content',
          comment: 'comment',
          dateEcheance: '2022-07-30T00:00:00.000+02:00',
          status: 'in_progress',
        },
        'accessToken'
      )
    })
  })

  describe('.qualifier', () => {
    it('qualifie une action', async () => {
      // Given
      ;(apiPost as jest.Mock).mockResolvedValue({
        content: {
          libelle: 'Non-SNP',
          code: CODE_QUALIFICATION_NON_SNP,
          heures: 5,
        },
      })

      // WHEN
      const actual = await qualifier('id-action', CODE_QUALIFICATION_NON_SNP, {
        commentaire: 'commentaire',
      })

      // THEN
      expect(apiPost).toHaveBeenCalledWith(
        '/actions/id-action/qualifier',
        {
          codeQualification: CODE_QUALIFICATION_NON_SNP,
          commentaireQualification: 'commentaire',
        },
        'accessToken'
      )
      const expected: QualificationAction = {
        libelle: 'Non-SNP',
        code: 'NON_SNP',
        isSituationNonProfessionnelle: false,
      }
      expect(actual).toStrictEqual(expected)
    })

    it('qualifie une action avec une date de début et date de fin', async () => {
      // Given
      ;(apiPost as jest.Mock).mockResolvedValue({
        content: {
          libelle: 'Santé',
          code: 'SANTE',
          heures: 5,
        },
      })

      // WHEN
      const actual = await qualifier('id-action', 'SANTE', {
        commentaire: 'commentaire',
        dateFinModifiee: DateTime.fromISO('2022-09-06T22:00:00.000Z'),
      })

      // THEN
      expect(apiPost).toHaveBeenCalledWith(
        '/actions/id-action/qualifier',
        {
          commentaireQualification: 'commentaire',
          codeQualification: 'SANTE',
          dateFinReelle: '2022-09-07T00:00:00.000+02:00',
        },
        'accessToken'
      )
      const expected: QualificationAction = {
        libelle: 'Santé',
        code: 'SANTE',
        isSituationNonProfessionnelle: true,
      }
      expect(actual).toStrictEqual(expected)
    })
  })

  describe('.qualifierActions', () => {
    it('qualifie plusieurs actions', async () => {
      // Given
      ;(apiPost as jest.Mock).mockResolvedValue({
        content: {
          idsActionsEnErreur: ['id-action-en-erreur'],
        },
      })

      // WHEN
      const actionsAQualifier = [
        { idAction: 'id-action', codeQualification: 'SANTE' },
        { idAction: 'id-action-en-erreur', codeQualification: 'EMPLOI' },
      ]
      const actual = await qualifierActions(actionsAQualifier, true)

      // THEN
      expect(apiPost).toHaveBeenCalledWith(
        '/conseillers/milo/actions/qualifier',
        {
          estSNP: true,
          qualifications: actionsAQualifier,
        },
        'accessToken'
      )
      expect(actual).toStrictEqual({
        idsActionsEnErreur: ['id-action-en-erreur'],
      })
    })
  })

  describe('.deleteAction', () => {
    it("supprime l'action", async () => {
      // WHEN
      await deleteAction('id-action')

      // THEN
      expect(apiDelete).toHaveBeenCalledWith(
        '/actions/id-action',
        'accessToken'
      )
    })
  })

  describe('.getSituationsNonProfessionnelles', () => {
    it('retourne la liste des situations non professionnelles', async () => {
      // GIVEN
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: desCategoriesAvecNONSNP(),
      })

      // WHEN
      const result = await getSituationsNonProfessionnelles(
        { avecNonSNP: true },
        'accessToken'
      )

      // THEN
      expect(apiGet).toHaveBeenCalledWith(
        '/referentiels/qualifications-actions/types',
        'accessToken'
      )
      expect(result).toEqual(desCategoriesAvecNONSNP())
    })

    it('retourne la liste des situations non professionnelles', async () => {
      // GIVEN
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: desCategoriesAvecNONSNP(),
      })

      // WHEN
      const result = await getSituationsNonProfessionnelles(
        { avecNonSNP: false },
        'accessToken'
      )

      // THEN
      expect(apiGet).toHaveBeenCalledWith(
        '/referentiels/qualifications-actions/types',
        'accessToken'
      )
      expect(result).toEqual(desCategories())
    })
  })

  describe('.recupereCompteursBeneficiairesPortefeuilleMilo', () => {
    it('retourne la liste des compteurs d’actions', async () => {
      jest
        .spyOn(DateTime, 'now')
        .mockReturnValue(DateTime.fromISO('2024-08-01'))
      const dateDebut = DateTime.now().startOf('week')
      const dateFin = DateTime.now().endOf('week')
      const dateDebutUrlEncoded = encodeURIComponent(dateDebut.toISO())
      const dateFinUrlEncoded = encodeURIComponent(dateFin.toISO())
      const compteursActions = [
        {
          idBeneficiaire: 'id-beneficiaire',
          actions: 3,
          rdvs: 2,
          sessions: 4,
        },
      ]

      ;(apiGet as jest.Mock).mockResolvedValue({
        content: compteursActions,
      })

      // WHEN
      const result = await recupereCompteursBeneficiairesPortefeuilleMilo(
        'id-conseiller',
        dateDebut,
        dateFin,
        'accessToken'
      )

      // THEN
      expect(apiGet).toHaveBeenCalledWith(
        `/conseillers/milo/id-conseiller/compteurs-portefeuille?dateDebut=${dateDebutUrlEncoded}&dateFin=${dateFinUrlEncoded}`,
        'accessToken'
      )
      expect(result).toEqual([
        {
          idBeneficiaire: 'id-beneficiaire',
          actions: 3,
          rdvs: 6,
        },
      ])
    })
  })
})
