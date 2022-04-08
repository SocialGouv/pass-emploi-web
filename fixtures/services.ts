import { ActionsService } from 'services/actions.service'
import { JeunesService } from 'services/jeunes.service'
import { RendezVousService } from 'services/rendez-vous.service'
import { MessagesService } from 'services/messages.service'

export function mockedJeunesService(
  overrides: Partial<JeunesService> = {}
): JeunesService {
  const defaults: JeunesService = {
    getJeunesDuConseiller: jest.fn(),
    getConseillersDuJeune: jest.fn(),
    getJeunesDuConseillerParEmail: jest.fn(),
    getJeuneDetails: jest.fn(),
    getIdJeuneMilo: jest.fn(),
    createCompteJeunePoleEmploi: jest.fn(),
    reaffecter: jest.fn(),
    supprimerJeune: jest.fn(),
  }
  return { ...defaults, ...overrides }
}

export function mockedActionsService(
  overrides: Partial<ActionsService> = {}
): ActionsService {
  const defaults: ActionsService = {
    createAction: jest.fn(),
    deleteAction: jest.fn(),
    getAction: jest.fn(),
    getActions: jest.fn(),
    getActionsJeune: jest.fn(),
    updateAction: jest.fn(),
  }
  return { ...defaults, ...overrides }
}

export function mockedMessagesService(
  overrides: Partial<MessagesService> = {}
): MessagesService {
  const defaults: MessagesService = {
    countMessagesNotRead: jest.fn(),
    observeJeuneChat: jest.fn(),
    observeJeuneReadingDate: jest.fn(),
    observeMessages: jest.fn(),
    setReadByConseiller: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    sendNouveauMessage: jest.fn(),
    sendNouveauMessageGroupe: jest.fn(),
  }
  return { ...defaults, ...overrides }
}

export function mockedRendezVousService(
  overrides: Partial<RendezVousService> = {}
): RendezVousService {
  const defaults: RendezVousService = {
    getRendezVousConseiller: jest.fn(),
    getRendezVousJeune: jest.fn(),
    getDetailRendezVous: jest.fn(),
    getTypesRendezVous: jest.fn(),
    postNewRendezVous: jest.fn(),
    updateRendezVous: jest.fn(),
    deleteRendezVous: jest.fn(),
  }
  return { ...defaults, ...overrides }
}
