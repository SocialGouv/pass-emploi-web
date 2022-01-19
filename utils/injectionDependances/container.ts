import { ApiClient } from 'clients/api.client'
import { FirebaseClient } from 'clients/firebase.client'
import { ActionsApiService, ActionsService } from 'services/actions.service'
import { AuthService, NextAuthService } from 'services/auth.service'
import {
  ConseillerApiService,
  ConseillerService,
} from 'services/conseiller.service'
import { JeunesApiService, JeunesService } from 'services/jeunes.service'
import {
  MessagesFirebaseAndApiService,
  MessagesService,
} from 'services/messages.service'
import {
  RendezVousApiService,
  RendezVousService,
} from 'services/rendez-vous.service'
import { Authenticator } from 'utils/auth/authenticator'
import { ChatCrypto } from 'utils/chat/chatCrypto'

export interface Dependencies {
  actionsService: ActionsService
  authenticator: Authenticator
  authService: AuthService
  conseillerService: ConseillerService
  jeunesService: JeunesService
  messagesService: MessagesService
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
    const nextAuthService: NextAuthService = new NextAuthService(apiClient)
    return new Container({
      actionsService: new ActionsApiService(apiClient),
      authenticator: new Authenticator(nextAuthService),
      authService: nextAuthService,
      conseillerService: new ConseillerApiService(apiClient),
      jeunesService: new JeunesApiService(apiClient),
      messagesService: new MessagesFirebaseAndApiService(
        new FirebaseClient(),
        new ChatCrypto(),
        apiClient
      ),
      rendezVousService: new RendezVousApiService(apiClient),
    })
  }
}
