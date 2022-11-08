import { ApiHttpClient } from 'clients/api.client'
import { FirebaseClient } from 'clients/firebase.client'
import { ActionsApiService, ActionsService } from 'services/actions.service'
import {
  ConseillerApiService,
  ConseillerService,
} from 'services/conseiller.service'
import { FavorisApiService, FavorisService } from 'services/favoris.service'
import { FichiersApiService, FichiersService } from 'services/fichiers.service'
import {
  ImmersionsApiService,
  ImmersionsService,
} from 'services/immersions.service'
import { JeunesApiService, JeunesService } from 'services/jeunes.service'
import {
  MessagesFirebaseAndApiService,
  MessagesService,
} from 'services/messages.service'
import {
  OffresEmploiApiService,
  OffresEmploiService,
} from 'services/offres-emploi.service'
import {
  ReferentielApiService,
  ReferentielService,
} from 'services/referentiel.service'
import {
  RendezVousApiService,
  RendezVousService,
} from 'services/rendez-vous.service'
import {
  ServicesCiviquesApiService,
  ServicesCiviquesService,
} from 'services/services-civiques.service'
import {
  SuggestionsApiService,
  SuggestionsService,
} from 'services/suggestions.service'
import { ChatCrypto } from 'utils/chat/chatCrypto'
import HttpClient from 'utils/httpClient'

export interface Dependencies {
  referentielService: ReferentielService
  actionsService: ActionsService
  conseillerService: ConseillerService
  jeunesService: JeunesService
  messagesService: MessagesService
  rendezVousService: RendezVousService
  fichiersService: FichiersService
  favorisService: FavorisService
  offresEmploiService: OffresEmploiService
  servicesCiviquesService: ServicesCiviquesService
  immersionsService: ImmersionsService
  suggestionsService: SuggestionsService
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
      referentielService: new ReferentielApiService(apiClient),
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
      favorisService: new FavorisApiService(apiClient),
      offresEmploiService: new OffresEmploiApiService(apiClient),
      servicesCiviquesService: new ServicesCiviquesApiService(apiClient),
      immersionsService: new ImmersionsApiService(apiClient),
      suggestionsService: new SuggestionsApiService(apiClient),
    })
  }
}
