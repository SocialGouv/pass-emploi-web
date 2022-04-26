import { ApiClient } from 'clients/api.client'
import {
  uneAction,
  uneActionJson,
  uneListeDActions,
  uneListeDActionsJson,
} from 'fixtures/action'
import { StatutAction } from 'interfaces/action'
import { ActionsApiService } from 'services/actions.service'

jest.mock('clients/api.client')

describe('ActionsApiService', () => {
  let apiClient: ApiClient
  let actionsService: ActionsApiService
  beforeEach(async () => {
    // Given
    apiClient = new ApiClient()
    actionsService = new ActionsApiService(apiClient)
  })

  describe('.getAction', () => {
    it('renvoie une action non commencée', async () => {
      // GIVEN
      const action = uneAction({ status: StatutAction.ARealiser })
      ;(apiClient.get as jest.Mock).mockImplementation((url: string) => {
        if (url.includes(action.id))
          return {
            ...uneActionJson({ id: action.id, status: 'not_started' }),
            jeune: 'jeune',
          }
      })

      // WHEN
      const actual = await actionsService.getAction(action.id, 'accessToken')

      // THEN
      expect(actual).toStrictEqual({ ...action, jeune: 'jeune' })
    })

    it('renvoie une action commencée', async () => {
      // GIVEN
      const action = uneAction({ status: StatutAction.Commencee })
      ;(apiClient.get as jest.Mock).mockImplementation((url: string) => {
        if (url.includes(action.id))
          return {
            ...uneActionJson({ id: action.id, status: 'in_progress' }),
            jeune: 'jeune',
          }
      })

      // WHEN
      const actual = await actionsService.getAction(action.id, 'accessToken')

      // THEN
      expect(actual).toStrictEqual({ ...action, jeune: 'jeune' })
    })

    it('renvoie une action terminée', async () => {
      // GIVEN
      const action = uneAction({ status: StatutAction.Terminee })
      ;(apiClient.get as jest.Mock).mockImplementation((url: string) => {
        if (url === `/actions/${action.id}`)
          return {
            ...uneActionJson({ id: action.id, status: 'done' }),
            jeune: 'jeune',
          }
      })

      // WHEN
      const actual = await actionsService.getAction(action.id, 'accessToken')

      // THEN
      expect(actual).toStrictEqual({ ...action, jeune: 'jeune' })
    })
  })

  describe('.getActionsJeune', () => {
    it('renvoie les actions du jeune', async () => {
      // GIVEN
      const actions = uneListeDActions()
      ;(apiClient.get as jest.Mock).mockImplementation((url: string) => {
        if (url === `/jeunes/whatever/actions`) return uneListeDActionsJson()
      })

      // WHEN
      const actual = await actionsService.getActionsJeune(
        'whatever',
        'accessToken'
      )

      // THEN
      expect(actual).toStrictEqual(actions)
    })
  })

  describe('.createAction', () => {
    it('crée une nouvelle action', async () => {
      // GIVEN
      // WHEN
      await actionsService.createAction(
        { intitule: 'content', commentaire: 'comment' },
        'id-conseiller',
        'id-jeune',
        'accessToken'
      )

      // THEN
      expect(apiClient.post).toHaveBeenCalledWith(
        '/conseillers/id-conseiller/jeunes/id-jeune/action',
        { content: 'content', comment: 'comment' },
        'accessToken'
      )
    })
  })

  describe('.updateAction', () => {
    it('met à jour une action non commencée', async () => {
      // WHEN
      const actual = await actionsService.updateAction(
        'id-action',
        StatutAction.ARealiser,
        'accessToken'
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
        StatutAction.Commencee,
        'accessToken'
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
        StatutAction.Terminee,
        'accessToken'
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

  describe('.deleteAction', () => {
    it("supprime l'action", async () => {
      // WHEN
      await actionsService.deleteAction('id-action', 'accessToken')

      // THEN
      expect(apiClient.delete).toHaveBeenCalledWith(
        '/actions/id-action',
        'accessToken'
      )
    })
  })
})
