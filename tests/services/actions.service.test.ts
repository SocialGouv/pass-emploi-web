import { ApiClient } from 'clients/api.client'
import {
  unCommentaire,
  uneAction,
  uneActionJson,
  uneListeDActions,
  uneListeDActionsJson,
} from 'fixtures/action'
import { QualificationAction, StatutAction } from 'interfaces/action'
import { CODE_QUALIFICATION_NON_SNP } from 'interfaces/json/action'
import { ActionsApiService } from 'services/actions.service'
import { FakeApiClient } from 'tests/utils/fakeApiClient'
import { ApiError } from 'utils/httpClient'

jest.mock('next-auth/react', () => ({
  getSession: jest.fn(() => ({
    user: { id: 'id-conseiller' },
    accessToken: 'accessToken',
  })),
}))

describe('ActionsApiService', () => {
  let apiClient: ApiClient
  let actionsService: ActionsApiService
  beforeEach(async () => {
    // Given
    apiClient = new FakeApiClient()
    actionsService = new ActionsApiService(apiClient)
  })

  describe('.getAction', () => {
    it('renvoie une action non commencée', async () => {
      // GIVEN
      const action = uneAction({ status: StatutAction.ARealiser })
      ;(apiClient.get as jest.Mock).mockImplementation((url: string) => {
        if (url.includes(action.id))
          return {
            content: {
              ...uneActionJson({ id: action.id, status: 'not_started' }),
              jeune: {
                id: 'jeune-1',
                firstName: 'Nadia',
                lastName: 'Sanfamiye',
              },
            },
          }
      })

      // WHEN
      const actual = await actionsService.getAction(action.id, 'accessToken')

      // THEN
      expect(actual).toStrictEqual({
        action,
        jeune: { id: 'jeune-1', prenom: 'Nadia', nom: 'Sanfamiye' },
      })
    })

    it('renvoie une action commencée', async () => {
      // GIVEN
      const action = uneAction({ status: StatutAction.Commencee })
      ;(apiClient.get as jest.Mock).mockImplementation((url: string) => {
        if (url.includes(action.id))
          return {
            content: {
              ...uneActionJson({ id: action.id, status: 'in_progress' }),
              jeune: {
                id: 'jeune-1',
                firstName: 'Nadia',
                lastName: 'Sanfamiye',
              },
            },
          }
      })

      // WHEN
      const actual = await actionsService.getAction(action.id, 'accessToken')

      // THEN
      expect(actual).toStrictEqual({
        action,
        jeune: { id: 'jeune-1', prenom: 'Nadia', nom: 'Sanfamiye' },
      })
    })

    it('renvoie une action terminée', async () => {
      // GIVEN
      const action = uneAction({ status: StatutAction.Terminee })
      ;(apiClient.get as jest.Mock).mockImplementation((url: string) => {
        if (url === `/actions/${action.id}`)
          return {
            content: {
              ...uneActionJson({ id: action.id, status: 'done' }),
              jeune: {
                id: 'jeune-1',
                firstName: 'Nadia',
                lastName: 'Sanfamiye',
              },
            },
          }
      })

      // WHEN
      const actual = await actionsService.getAction(action.id, 'accessToken')

      // THEN
      expect(actual).toStrictEqual({
        action,
        jeune: { id: 'jeune-1', prenom: 'Nadia', nom: 'Sanfamiye' },
      })
    })

    it('renvoie une action qualifiée en SNP', async () => {
      // GIVEN
      const action = uneAction({
        status: StatutAction.Terminee,
        qualification: {
          libelle: 'Santé',
          isSituationNonProfessionnelle: true,
        },
      })
      ;(apiClient.get as jest.Mock).mockImplementation((url: string) => {
        if (url === `/actions/${action.id}`)
          return {
            content: {
              ...uneActionJson({
                id: action.id,
                status: 'done',
                qualification: {
                  libelle: 'Santé',
                  code: 'SANTE',
                },
              }),
              jeune: {
                id: 'jeune-1',
                firstName: 'Nadia',
                lastName: 'Sanfamiye',
              },
            },
          }
      })

      // WHEN
      const actual = await actionsService.getAction(action.id, 'accessToken')

      // THEN
      expect(actual).toStrictEqual({
        action,
        jeune: { id: 'jeune-1', prenom: 'Nadia', nom: 'Sanfamiye' },
      })
    })

    it('renvoie une action qualifiée en NON SNP', async () => {
      // GIVEN
      const action = uneAction({
        status: StatutAction.Terminee,
        qualification: {
          libelle: 'Situation pas non professionnelle',
          isSituationNonProfessionnelle: false,
        },
      })
      ;(apiClient.get as jest.Mock).mockImplementation((url: string) => {
        if (url === `/actions/${action.id}`)
          return {
            content: {
              ...uneActionJson({
                id: action.id,
                status: 'done',
                qualification: {
                  libelle: 'Situation pas non professionnelle',
                  code: 'NON_SNP',
                },
              }),
              jeune: {
                id: 'jeune-1',
                firstName: 'Nadia',
                lastName: 'Sanfamiye',
              },
            },
          }
      })

      // WHEN
      const actual = await actionsService.getAction(action.id, 'accessToken')

      // THEN
      expect(actual).toStrictEqual({
        action,
        jeune: { id: 'jeune-1', prenom: 'Nadia', nom: 'Sanfamiye' },
      })
    })

    it('ne renvoie pas une action inexistante', async () => {
      // GIVEN
      ;(apiClient.get as jest.Mock).mockRejectedValue(
        new ApiError(404, 'Action non trouvée')
      )

      // WHEN
      const actual = await actionsService.getAction('action-id', 'accessToken')

      // THEN
      expect(actual).toEqual(undefined)
    })
  })

  describe('.getActionsJeuneClientSide', () => {
    it('renvoie les actions du jeune', async () => {
      // GIVEN
      const actions = uneListeDActions()
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: {
          actions: uneListeDActionsJson(),
          metadonnees: { nombreTotal: 82, nombreActionsParPage: 10 },
        },
      })

      // WHEN
      const actual = await actionsService.getActionsJeuneClientSide(
        'whatever',
        { tri: 'date_decroissante', page: 1, statuts: [] }
      )

      // THEN
      expect(apiClient.get).toHaveBeenCalledWith(
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
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: {
          actions: uneListeDActionsJson(),
          metadonnees: {
            nombreTotal: 82,
            nombreEnCours: 42,
            nombreTerminees: 30,
            nombreAnnulees: 1,
            nombrePasCommencees: 9,
            nombreActionsParPage: 10,
          },
        },
      })

      // WHEN
      const actual = await actionsService.getActionsJeuneClientSide(
        'whatever',
        {
          tri: 'date_decroissante',
          page: 1,
          statuts: [StatutAction.Commencee, StatutAction.ARealiser],
        }
      )

      // THEN
      expect(apiClient.get).toHaveBeenCalledWith(
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
  })

  describe('.getActionsJeuneServerSide', () => {
    it('renvoie les actions du jeune', async () => {
      // GIVEN
      const actions = uneListeDActions()
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: {
          actions: uneListeDActionsJson(),
          metadonnees: { nombreTotal: 82, nombreActionsParPage: 10 },
        },
      })

      // WHEN
      const actual = await actionsService.getActionsJeuneServerSide(
        'whatever',
        {
          page: 1,
          statuts: [],
        },
        'accessToken'
      )

      // THEN
      expect(apiClient.get).toHaveBeenCalledWith(
        '/v2/jeunes/whatever/actions?page=1&tri=date_echeance_decroissante',
        'accessToken'
      )
      expect(actual).toStrictEqual({
        actions,
        metadonnees: { nombrePages: 9, nombreTotal: 82 },
      })
    })

    it('parse le paramètre pour filtrer les actions par statut et compte le nombre de pages', async () => {
      // GIVEN
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: {
          actions: uneListeDActionsJson(),
          metadonnees: {
            nombreTotal: 82,
            nombreEnCours: 42,
            nombreTerminees: 30,
            nombreAnnulees: 1,
            nombrePasCommencees: 9,
            nombreActionsParPage: 10,
          },
        },
      })

      // WHEN
      const actual = await actionsService.getActionsJeuneServerSide(
        'whatever',
        {
          tri: 'date_echeance_decroissante',
          page: 1,
          statuts: [StatutAction.Commencee, StatutAction.ARealiser],
        },
        'accessToken'
      )

      // THEN
      expect(apiClient.get).toHaveBeenCalledWith(
        '/v2/jeunes/whatever/actions?page=1&tri=date_echeance_decroissante&statuts=in_progress&statuts=not_started',
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
  })

  describe('.createAction', () => {
    it('crée une nouvelle action', async () => {
      // GIVEN
      // WHEN
      await actionsService.createAction(
        {
          intitule: 'content',
          commentaire: 'comment',
          dateEcheance: '2022-07-30',
        },
        'id-jeune'
      )

      // THEN
      expect(apiClient.post).toHaveBeenCalledWith(
        '/conseillers/id-conseiller/jeunes/id-jeune/action',
        {
          content: 'content',
          comment: 'comment',
          dateEcheance: '2022-07-30T00:00:00.000+02:00',
        },
        'accessToken'
      )
    })
  })

  describe('.updateAction', () => {
    it('met à jour une action non commencée', async () => {
      // WHEN
      const actual = await actionsService.updateAction(
        'id-action',
        StatutAction.ARealiser
      )

      // THEN
      expect(apiClient.put).toHaveBeenCalledWith(
        '/actions/id-action',
        { status: 'not_started' },
        'accessToken'
      )
      expect(actual).toStrictEqual(StatutAction.ARealiser)
    })

    it('met à jour une action commencée', async () => {
      // WHEN
      const actual = await actionsService.updateAction(
        'id-action',
        StatutAction.Commencee
      )

      // THEN
      expect(apiClient.put).toHaveBeenCalledWith(
        '/actions/id-action',
        { status: 'in_progress' },
        'accessToken'
      )
      expect(actual).toStrictEqual(StatutAction.Commencee)
    })

    it('met à jour une action terminée', async () => {
      // WHEN
      const actual = await actionsService.updateAction(
        'id-action',
        StatutAction.Terminee
      )

      // THEN
      expect(apiClient.put).toHaveBeenCalledWith(
        '/actions/id-action',
        { status: 'done' },
        'accessToken'
      )
      expect(actual).toStrictEqual(StatutAction.Terminee)
    })
  })

  describe('.qualifier', () => {
    it('qualifie une action', async () => {
      // Given
      ;(apiClient.post as jest.Mock).mockResolvedValue({
        content: {
          libelle: 'Non-SNP',
          code: CODE_QUALIFICATION_NON_SNP,
        },
      })

      // WHEN
      const actual = await actionsService.qualifier(
        'id-action',
        CODE_QUALIFICATION_NON_SNP
      )

      // THEN
      expect(apiClient.post).toHaveBeenCalledWith(
        '/actions/id-action/qualifier',
        { codeQualification: CODE_QUALIFICATION_NON_SNP },
        'accessToken'
      )
      const expected: QualificationAction = {
        libelle: 'Non-SNP',
        isSituationNonProfessionnelle: false,
      }
      expect(actual).toStrictEqual(expected)
    })
  })

  describe('.deleteAction', () => {
    it("supprime l'action", async () => {
      // WHEN
      await actionsService.deleteAction('id-action')

      // THEN
      expect(apiClient.delete).toHaveBeenCalledWith(
        '/actions/id-action',
        'accessToken'
      )
    })
  })

  describe('.ajouterCommentaire', () => {
    it('ajoute un commentaire à une action', async () => {
      // GIVEN
      const commentaire = unCommentaire()
      ;(apiClient.post as jest.Mock).mockResolvedValue({ content: commentaire })
      // WHEN
      const result = await actionsService.ajouterCommentaire(
        'id-action',
        'comment'
      )

      // THEN
      expect(apiClient.post).toHaveBeenCalledWith(
        '/actions/id-action/commentaires',
        {
          commentaire: 'comment',
        },
        'accessToken'
      )
      expect(result).toEqual(commentaire)
    })
  })

  describe('.recupererLesCommentaires', () => {
    it("retourne les commentaires d'une action", async () => {
      // GIVEN
      const commentaire = unCommentaire()
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: [commentaire],
      })
      // WHEN
      const result = await actionsService.recupererLesCommentaires(
        'id-action',
        'accessToken'
      )

      // THEN
      expect(apiClient.get).toHaveBeenCalledWith(
        '/actions/id-action/commentaires',
        'accessToken'
      )
      expect(result).toEqual([commentaire])
    })
  })

  describe('.getSituationsNonProfessionnelles', () => {
    it('retourne la liste des situations non professionnelles', async () => {
      // GIVEN
      const situationsNonProfessionnelles = [
        { code: 'SNP_1', label: 'SNP 1' },
        { code: 'SNP_2', label: 'SNP 2' },
        { code: 'SNP_3', label: 'SNP 3' },
      ]
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: situationsNonProfessionnelles,
      })

      // WHEN
      const result = await actionsService.getSituationsNonProfessionnelles(
        'accessToken'
      )

      // THEN
      expect(apiClient.get).toHaveBeenCalledWith(
        '/referentiels/qualifications-actions/types',
        'accessToken'
      )
      expect(result).toEqual(situationsNonProfessionnelles)
    })
  })
})
