import { ApiClient } from 'clients/api.client'
import { ActionsApiService } from 'services/actions.service'
import {
  uneAction,
  uneActionJson,
  uneListeDActions,
  uneListeDActionsJson,
} from '../../fixtures/action'
import { ActionStatus } from '../../interfaces/action'

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
      const action = uneAction({ status: ActionStatus.NotStarted })
      ;(apiClient.get as jest.Mock).mockImplementation((url: string) => {
        if (url.includes(action.id))
          return uneActionJson({ id: action.id, status: 'not_started' })
      })

      // WHEN
      const actual = await actionsService.getAction(action.id, 'accessToken')

      // THEN
      expect(actual).toStrictEqual(action)
    })

    it('renvoie une action commencée', async () => {
      // GIVEN
      const action = uneAction({ status: ActionStatus.InProgress })
      ;(apiClient.get as jest.Mock).mockImplementation((url: string) => {
        if (url.includes(action.id))
          return uneActionJson({ id: action.id, status: 'in_progress' })
      })

      // WHEN
      const actual = await actionsService.getAction(action.id, 'accessToken')

      // THEN
      expect(actual).toStrictEqual(action)
    })

    it('renvoie une action terminée', async () => {
      // GIVEN
      const action = uneAction({ status: ActionStatus.Done })
      ;(apiClient.get as jest.Mock).mockImplementation((url: string) => {
        if (url === `/actions/${action.id}`)
          return uneActionJson({ id: action.id, status: 'done' })
      })

      // WHEN
      const actual = await actionsService.getAction(action.id, 'accessToken')

      // THEN
      expect(actual).toStrictEqual(action)
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
      const newAction: any = {
        content: 'content',
        comment: 'comment',
      }

      // WHEN
      await actionsService.createAction(
        newAction,
        'id-conseiller',
        'id-jeune',
        'accessToken'
      )

      // THEN
      expect(apiClient.post).toHaveBeenCalledWith(
        '/conseillers/id-conseiller/jeunes/id-jeune/action',
        newAction,
        'accessToken'
      )
    })
  })

  describe('.updateAction', () => {
    it('met à jour une action non commencée', async () => {
      // WHEN
      const actual = await actionsService.updateAction(
        'id-action',
        ActionStatus.NotStarted,
        'accessToken'
      )

      // THEN
      expect(apiClient.put).toHaveBeenCalledWith(
        '/actions/id-action',
        { status: 'not_started' },
        'accessToken'
      )
      expect(actual).toStrictEqual(ActionStatus.NotStarted)
    })

    it('met à jour une action commencée', async () => {
      // WHEN
      const actual = await actionsService.updateAction(
        'id-action',
        ActionStatus.InProgress,
        'accessToken'
      )

      // THEN
      expect(apiClient.put).toHaveBeenCalledWith(
        '/actions/id-action',
        { status: 'in_progress' },
        'accessToken'
      )
      expect(actual).toStrictEqual(ActionStatus.InProgress)
    })

    it('met à jour une action terminée', async () => {
      // WHEN
      const actual = await actionsService.updateAction(
        'id-action',
        ActionStatus.Done,
        'accessToken'
      )

      // THEN
      expect(apiClient.put).toHaveBeenCalledWith(
        '/actions/id-action',
        { status: 'done' },
        'accessToken'
      )
      expect(actual).toStrictEqual(ActionStatus.Done)
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
