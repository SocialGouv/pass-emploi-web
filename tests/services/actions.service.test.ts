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
import { uneDemarcheJson, uneListeDeDemarches } from 'fixtures/beneficiaire'
import { StatutAction } from 'interfaces/action'
import { CODE_QUALIFICATION_NON_SNP } from 'interfaces/json/action'
import { StatutDemarche } from 'interfaces/json/beneficiaire'
import { qualifier } from 'server-actions/actions.server-actions'
import {
  creerAction,
  deleteAction,
  getAction,
  getActionsAQualifierClientSide,
  getActionsAQualifierServerSide,
  getActionsBeneficiaireClientSide,
  getActionsBeneficiaireServerSide,
  getDemarchesBeneficiaire,
  qualifierActions,
} from 'services/actions.service'
import { getSituationsNonProfessionnelles } from 'services/referentiel.service'
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
        'accessToken',
        'actions'
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
        'accessToken',
        'actions'
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
        'accessToken',
        'actions'
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
        'accessToken',
        'actions'
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
        'accessToken',
        'actions'
      )
      expect(actual).toStrictEqual({
        actions,
        metadonnees: { nombrePages: 9, nombreTotal: 82 },
      })
    })
  })

  describe('.getActionsAQualifierClientSide', () => {
    it('renvoie les actions du conseiller à qualifier', async () => {
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
        tri: 'ALPHABETIQUE',
        filtres: ['SANTE', 'EMPLOI'],
      })

      // THEN
      expect(apiGet).toHaveBeenCalledWith(
        '/v2/conseillers/whatever/actions?page=1&aQualifier=true&tri=BENEFICIAIRE_ALPHABETIQUE&codesCategories=SANTE&codesCategories=EMPLOI',
        'accessToken',
        'actions'
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
        '/v2/conseillers/whatever/actions?page=1&aQualifier=true',
        'accessToken',
        'actions'
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
        '/conseillers/id-conseiller/jeunes/id-jeune/action',
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
      await qualifier('id-action', CODE_QUALIFICATION_NON_SNP, {
        commentaire: 'commentaire',
      })

      // THEN
      expect(apiPost).toHaveBeenCalledWith(
        '/actions/id-action/qualifier',
        {
          codeQualification: CODE_QUALIFICATION_NON_SNP,
          commentaireQualification: 'commentaire',
        },
        'accessToken',
        ['action', 'actions']
      )
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
      await qualifier('id-action', 'SANTE', {
        commentaire: 'commentaire',
        dateFinModifiee: '2022-09-06T22:00:00.000Z',
      })

      // THEN
      expect(apiPost).toHaveBeenCalledWith(
        '/actions/id-action/qualifier',
        {
          commentaireQualification: 'commentaire',
          codeQualification: 'SANTE',
          dateFinReelle: '2022-09-06T22:00:00.000Z',
        },
        'accessToken',
        ['action', 'actions']
      )
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
        'accessToken',
        'referentiel'
      )
      expect(result).toEqual(desCategoriesAvecNONSNP())
    })

    it('retourne la liste des situations non professionnelles sans Non SNP', async () => {
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
        'accessToken',
        'referentiel'
      )
      expect(result).toEqual(desCategories())
    })
  })

  describe('.getDemarchesBeneficiaire', () => {
    it('renvoie les démarches du bénéficiaire à partir d’une date', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: {
          queryModel: [
            uneDemarcheJson(),
            uneDemarcheJson({
              id: 'id-demarche-2',
              statut: StatutDemarche.A_FAIRE,
              attributs: [
                { cle: 'description', valeur: 'Démarche personnalisée' },
              ],
            }),
          ],
        },
      })
      const dateDebut = DateTime.fromISO('2024-09-10')

      // When
      const actual = await getDemarchesBeneficiaire(
        'id-jeune',
        dateDebut,
        'id-conseiller',
        'accessToken'
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers/id-conseiller/jeunes/id-jeune/demarches?dateDebut=2024-09-10T00%3A00%3A00.000%2B02%3A00',
        'accessToken',
        'actions'
      )
      expect(actual).toEqual({ data: uneListeDeDemarches(), isStale: false })
    })

    it('renvoie les démarches pas fraiches', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: {
          queryModel: [
            uneDemarcheJson(),
            uneDemarcheJson({
              id: 'id-demarche-2',
              statut: StatutDemarche.A_FAIRE,
              attributs: [
                { cle: 'description', valeur: 'Démarche personnalisée' },
              ],
            }),
          ],
          dateDuCache: '2024-04-12',
        },
      })
      const dateDebut = DateTime.fromISO('2024-09-10')

      // When
      const actual = await getDemarchesBeneficiaire(
        'id-jeune',
        dateDebut,
        'id-conseiller',
        'accessToken'
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers/id-conseiller/jeunes/id-jeune/demarches?dateDebut=2024-09-10T00%3A00%3A00.000%2B02%3A00',
        'accessToken',
        'actions'
      )
      expect(actual).toEqual({ data: uneListeDeDemarches(), isStale: true })
    })

    it('renvoie un échec', async () => {
      // Given
      ;(apiGet as jest.Mock).mockRejectedValue(
        new ApiError(404, 'Erreur lors de la récupération des démarches')
      )
      const dateDebut = DateTime.fromISO('2024-09-10')

      // When
      const actual = await getDemarchesBeneficiaire(
        'id-jeune',
        dateDebut,
        'id-conseiller',
        'accessToken'
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers/id-conseiller/jeunes/id-jeune/demarches?dateDebut=2024-09-10T00%3A00%3A00.000%2B02%3A00',
        'accessToken',
        'actions'
      )
      expect(actual).toEqual(null)
    })
  })
})
