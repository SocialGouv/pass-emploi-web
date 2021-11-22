import { ActionsService } from 'services/actions.service'

export interface Dependances {
  actionsService: ActionsService
}

export class Container {
  private static diContainer: Container | undefined

  private constructor (readonly dependances: Dependances) {
  }

  static getDIContainer (): Container {
    if (!Container.diContainer) {
      Container.diContainer = Container.buildDIContainer()
    }
    return Container.diContainer
  }

  private static buildDIContainer () {
    return new Container({
      actionsService: new ActionsService()
    })
  }
}
