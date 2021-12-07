import { ActionsApiService, ActionsService } from 'services/actions.service'
import { JeunesService } from 'services/jeunes.service'
import { RendezVousService } from 'services/rendez-vous.service'
import { ApiClient } from '../../clients/api.client'

export interface Dependencies {
  actionsService: ActionsService
  jeunesService: JeunesService
  rendezVousService: RendezVousService
}

export class Container {
  private static diContainer: Container | undefined

  private constructor(readonly dependances: Dependencies) {}

  static getDIContainer(): Container {
    if (!Container.diContainer) {
      Container.diContainer = Container.buildDIContainer()
    }
    return Container.diContainer
  }

  private static buildDIContainer() {
    const apiClient = new ApiClient()

    return new Container({
      actionsService: new ActionsApiService(apiClient),
      jeunesService: new JeunesService(apiClient),
      rendezVousService: new RendezVousService(apiClient),
    })
  }
}
