import { ApiClient } from 'clients/api.client'
import { ActionsApiService, ActionsService } from 'services/actions.service'
import {
  ConseillerApiService,
  ConseillerService,
} from 'services/conseiller.service'
import { JeunesApiService, JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import { RendezVousService } from 'services/rendez-vous.service'
import { ChatCrypto } from 'utils/chat/chatCrypto'
import { db } from 'utils/firebase'

export interface Dependencies {
  actionsService: ActionsService
  conseillerService: ConseillerService
  jeunesService: JeunesService
  messagesService: MessagesService
  rendezVousService: RendezVousService
  chatCrypto: ChatCrypto
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
    const chatCrypto = new ChatCrypto()

    return new Container({
      actionsService: new ActionsApiService(apiClient),
      conseillerService: new ConseillerApiService(apiClient),
      jeunesService: new JeunesApiService(apiClient),
      messagesService: new MessagesService(apiClient, db, chatCrypto),
      rendezVousService: new RendezVousService(apiClient),
      chatCrypto,
    })
  }
}
