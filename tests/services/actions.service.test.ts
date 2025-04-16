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
  getActionsBeneficiaire,
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
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: uneActionJson({ id: action.id, status: 'not_started' }),
      })

      // WHEN
      const actual = await getAction(action.id, 'accessToken')

      // THEN
      expect(apiGet).toHaveBeenCalledWith('/actions/id-action-1', 'accessToken')
      expect(actual).toStrictEqual(action)
    })

    it('renvoie une action commencée', async () => {
      // GIVEN
      const action = uneAction({ status: StatutAction.AFaire })
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: uneActionJson({ id: action.id, status: 'in_progress' }),
      })

      // WHEN
      const actual = await getAction(action.id, 'accessToken')

      // THEN
      expect(apiGet).toHaveBeenCalledWith('/actions/id-action-1', 'accessToken')
      expect(actual).toStrictEqual(action)
    })

    it('renvoie une action terminée', async () => {
      // GIVEN
      const action = uneAction({ status: StatutAction.Terminee })
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: uneActionJson({ id: action.id, status: 'done' }),
      })

      // WHEN
      const actual = await getAction(action.id, 'accessToken')

      // THEN
      expect(apiGet).toHaveBeenCalledWith('/actions/id-action-1', 'accessToken')
      expect(actual).toStrictEqual(action)
    })

    it('renvoie une action à qualifier', async () => {
      // GIVEN
      const action = uneAction({ status: StatutAction.TermineeAQualifier })
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: uneActionJson({
          id: action.id,
          status: 'done',
          etat: 'A_QUALIFIER',
        }),
      })

      // WHEN
      const actual = await getAction(action.id, 'accessToken')

      // THEN
      expect(apiGet).toHaveBeenCalledWith('/actions/id-action-1', 'accessToken')
      expect(actual).toStrictEqual(action)
    })

    it('renvoie une action annulée', async () => {
      // GIVEN
      const action = uneAction({ status: StatutAction.Annulee })
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: uneActionJson({ id: action.id, status: 'canceled' }),
      })

      // WHEN
      const actual = await getAction(action.id, 'accessToken')

      // THEN
      expect(apiGet).toHaveBeenCalledWith('/actions/id-action-1', 'accessToken')
      expect(actual).toStrictEqual(action)
    })

    it('renvoie une action qualifiée en SNP', async () => {
      // GIVEN
      const action = uneAction({
        status: StatutAction.TermineeQualifiee,
        qualification: {
          libelle: 'Santé',
          code: 'SANTE',
          isSituationNonProfessionnelle: true,
        },
      })
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: uneActionJson({
          id: action.id,
          status: 'done',
          etat: 'QUALIFIEE',
          qualification: {
            libelle: 'Santé',
            code: 'SANTE',
            heures: 5,
          },
        }),
      })

      // WHEN
      const actual = await getAction(action.id, 'accessToken')

      // THEN
      expect(apiGet).toHaveBeenCalledWith('/actions/id-action-1', 'accessToken')
      expect(actual).toStrictEqual(action)
    })

    it('renvoie une action qualifiée en NON SNP', async () => {
      // GIVEN
      const action = uneAction({
        status: StatutAction.TermineeQualifiee,
        qualification: {
          libelle: 'Situation pas non professionnelle',
          code: 'NON_SNP',
          isSituationNonProfessionnelle: false,
        },
      })
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: uneActionJson({
          id: action.id,
          status: 'done',
          etat: 'QUALIFIEE',
          qualification: {
            libelle: 'Situation pas non professionnelle',
            code: 'NON_SNP',
            heures: 5,
          },
        }),
      })

      // WHEN
      const actual = await getAction(action.id, 'accessToken')

      // THEN
      expect(apiGet).toHaveBeenCalledWith('/actions/id-action-1', 'accessToken')
      expect(actual).toStrictEqual(action)
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

  describe('.getActionsBeneficiaire', () => {
    it('renvoie les actions du jeune', async () => {
      // GIVEN
      const debut = DateTime.fromISO('2023-03-12T05:24:41.000Z')
      const fin = DateTime.fromISO('2023-03-19T18:53:51.000Z')
      const actions = uneListeDActions()
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: uneListeDActionsJson(),
      })

      // WHEN
      const actual = await getActionsBeneficiaire('whatever', {
        debut,
        fin,
        label: 'whatever',
      })

      // THEN
      expect(apiGet).toHaveBeenCalledWith(
        '/jeunes/whatever/actions?dateDebut=2023-03-12T06%3A24%3A41.000%2B01%3A00&dateFin=2023-03-19T19%3A53%3A51.000%2B01%3A00',
        'accessToken'
      )
      expect(actual).toStrictEqual(actions)
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
        '/conseillers/id-conseiller-1/jeunes/id-jeune/action',
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
        'id-conseiller-1',
        dateDebut,
        dateFin,
        'accessToken'
      )

      // THEN
      expect(apiGet).toHaveBeenCalledWith(
        `/conseillers/milo/id-conseiller-1/compteurs-portefeuille?dateDebut=${dateDebutUrlEncoded}&dateFin=${dateFinUrlEncoded}`,
        'accessToken'
      )
      expect(result).toEqual([
        {
          idBeneficiaire: 'id-beneficiaire',
          actionsCreees: 3,
          rdvs: 6,
        },
      ])
    })
  })
})
