import { ActionsService } from 'services/actions.service'
import { AgencesApiService, AgencesService } from 'services/agences.service'
import { ConseillerService } from 'services/conseiller.service'
import { FavorisService } from 'services/favoris.service'
import { FichiersService } from 'services/fichiers.service'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import { RendezVousService } from 'services/rendez-vous.service'

export function mockedJeunesService(
  overrides: Partial<JeunesService> = {}
): JeunesService {
  const defaults: JeunesService = {
    getJeunesDuConseillerServerSide: jest.fn(),
    getJeunesDuConseillerClientSide: jest.fn(),
    getConseillersDuJeuneServerSide: jest.fn(),
    getConseillersDuJeuneClientSide: jest.fn(),
    getJeunesDuConseillerParEmail: jest.fn(),
    getJeuneDetails: jest.fn(),
    getIdJeuneMilo: jest.fn(),
    createCompteJeunePoleEmploi: jest.fn(),
    reaffecter: jest.fn(),
    supprimerJeuneInactif: jest.fn(),
    archiverJeune: jest.fn(),
    getMotifsSuppression: jest.fn(),
    getMetadonneesFavorisJeune: jest.fn(),
    modifierIdentifiantPartenaire: jest.fn(),
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
    countActionsJeunes: jest.fn(),
    getActionsJeuneServerSide: jest.fn(),
    getActionsJeuneClientSide: jest.fn(),
    updateAction: jest.fn(),
    recupererLesCommentaires: jest.fn(),
    ajouterCommentaire: jest.fn(),
    qualifier: jest.fn(),
    getSituationsNonProfessionnelles: jest.fn(),
  }
  return { ...defaults, ...overrides }
}

export function mockedMessagesService(
  overrides: Partial<MessagesService> = {}
): MessagesService {
  const defaults: MessagesService = {
    getChatCredentials: jest.fn(),
    countMessagesNotRead: jest.fn(),
    observeConseillerChats: jest.fn(),
    observeJeuneReadingDate: jest.fn(),
    observeMessages: jest.fn(),
    setReadByConseiller: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    sendNouveauMessage: jest.fn(),
    sendNouveauMessageGroupe: jest.fn(),
    toggleFlag: jest.fn(),
  }
  return { ...defaults, ...overrides }
}

export function mockedRendezVousService(
  overrides: Partial<RendezVousService> = {}
): RendezVousService {
  const defaults: RendezVousService = {
    getRendezVousConseillerClientSide: jest.fn(),
    getRendezVousJeune: jest.fn(),
    getDetailsRendezVous: jest.fn(),
    getTypesRendezVous: jest.fn(),
    postNewRendezVous: jest.fn(),
    updateRendezVous: jest.fn(),
    deleteRendezVous: jest.fn(),
  }
  return { ...defaults, ...overrides }
}

export function mockedConseillerService(
  overrides: Partial<ConseillerService> = {}
): ConseillerService {
  const defaults: ConseillerService = {
    getConseillerServerSide: jest.fn(),
    getConseillerClientSide: jest.fn(),
    modifierAgence: jest.fn(),
    modifierNotificationsSonores: jest.fn(),
    getDossierJeune: jest.fn(),
    createCompteJeuneMilo: jest.fn(),
    recupererBeneficiaires: jest.fn(),
  }
  return { ...defaults, ...overrides }
}

export function mockedAgencesService(
  overrides: Partial<AgencesApiService> = {}
): AgencesService {
  const defaults: AgencesService = {
    getAgences: jest.fn(),
  }
  return { ...defaults, ...overrides }
}

export function mockedFichiersService(
  overrides: Partial<FichiersService> = {}
): FichiersService {
  const defaults: FichiersService = {
    uploadFichier: jest.fn(),
    deleteFichier: jest.fn(),
  }
  return { ...defaults, ...overrides }
}

export function mockedFavorisService(
  overrides: Partial<FavorisService> = {}
): FavorisService {
  const defaults: FavorisService = {
    getOffres: jest.fn(),
    getRecherchesSauvegardees: jest.fn(),
  }
  return { ...defaults, ...overrides }
}
