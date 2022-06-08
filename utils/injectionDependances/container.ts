import { ApiHttpClient } from 'clients/api.client'
import { FirebaseClient } from 'clients/firebase.client'
import { ActionsApiService, ActionsService } from 'services/actions.service'
import { AgencesApiService, AgencesService } from 'services/agences.service'
import {
  ConseillerApiService,
  ConseillerService,
} from 'services/conseiller.service'
import { FichiersApiService, FichiersService } from 'services/fichiers.services'
import { JeunesApiService, JeunesService } from 'services/jeunes.service'
import {
  MessagesFirebaseAndApiService,
  MessagesService,
} from 'services/messages.service'
import {
  RendezVousApiService,
  RendezVousService,
} from 'services/rendez-vous.service'
import { ChatCrypto } from 'utils/chat/chatCrypto'
import HttpClient from 'utils/httpClient'

export interface Dependencies {
  agencesService: AgencesService
  actionsService: ActionsService
  conseillerService: ConseillerService
  jeunesService: JeunesService
  messagesService: MessagesService
  rendezVousService: RendezVousService
  fichiersService: FichiersService
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
    const apiClient = new ApiHttpClient(new HttpClient())
    return new Container({
      agencesService: new AgencesApiService(apiClient),
      actionsService: new ActionsApiService(apiClient),
      conseillerService: new ConseillerApiService(apiClient),
      jeunesService: new JeunesApiService(apiClient),
      messagesService: new MessagesFirebaseAndApiService(
        new FirebaseClient(),
        new ChatCrypto(),
        apiClient
      ),
      rendezVousService: new RendezVousApiService(apiClient),
      fichiersService: new FichiersApiService(apiClient),
    })
  }
}
