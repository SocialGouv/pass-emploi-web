import { act, screen, within } from '@testing-library/react'
import React from 'react'

import ChatRoom from 'components/chat/ChatRoom'
import { desItemsJeunes, extractBaseJeune, unJeuneChat } from 'fixtures/jeune'
import { desListesDeDiffusion } from 'fixtures/listes-de-diffusion'
import { desMessagesListeDeDiffusionParJour } from 'fixtures/message'
import {
  mockedJeunesService,
  mockedListesDeDiffusionService,
  mockedMessagesService,
} from 'fixtures/services'
import { StructureConseiller } from 'interfaces/conseiller'
import { BaseJeune, ConseillerHistorique, JeuneChat } from 'interfaces/jeune'
import { Message } from 'interfaces/message'
import Messagerie from 'pages/messagerie'
import { JeunesService } from 'services/jeunes.service'
import { ListesDeDiffusionService } from 'services/listes-de-diffusion.service'
import { MessagesService } from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('Messagerie', () => {
  describe('client side', () => {
    const jeunes: BaseJeune[] = desItemsJeunes().map(extractBaseJeune)
    let jeunesChats: JeuneChat[]
    let jeunesService: JeunesService
    let messagesService: MessagesService
    let listesDeDiffusionService: ListesDeDiffusionService
    let conseillers: ConseillerHistorique[]
    let updateChatsRef: (chats: JeuneChat[]) => void
    let messages: Message[]

    beforeEach(async () => {
      jeunesService = mockedJeunesService({
        getConseillersDuJeuneClientSide: jest.fn((_) =>
          Promise.resolve(conseillers)
        ),
      })
      messages = desMessagesListeDeDiffusionParJour()
      messagesService = mockedMessagesService({
        observeConseillerChats: jest.fn((jeune, _cle, fn) => {
          updateChatsRef = fn
          updateChatsRef(jeunesChats)
          return Promise.resolve(() => {})
        }),
        getMessagesListeDeDiffusion: jest.fn(async () => messages),
      })
      listesDeDiffusionService = mockedListesDeDiffusionService({
        getListesDeDiffusionClientSide: jest.fn(async () =>
          desListesDeDiffusion()
        ),
      })
      jeunesChats = [
        unJeuneChat({
          ...jeunes[0],
          chatId: `chat-${jeunes[0].id}`,
          seenByConseiller: true,
        }),
        unJeuneChat({
          ...jeunes[1],
          chatId: `chat-${jeunes[1].id}`,
          seenByConseiller: true,
        }),
        unJeuneChat({
          ...jeunes[2],
          chatId: `chat-${jeunes[2].id}`,
          seenByConseiller: false,
        }),
      ]
    })

    describe('tunnel de messagerie', () => {
      it('affiche un message de bienvenue au landing sur la page', async () => {
        //When
        await renderWithContexts(<Messagerie pageTitle='' />, {
          customDependances: {
            jeunesService,
            messagesService,
            listesDeDiffusionService,
          },
          customConseiller: {
            structure: StructureConseiller.POLE_EMPLOI,
          },
        })
        //Then
        expect(
          screen.getByText('Bienvenue dans votre espace de messagerie.')
        ).toBeInTheDocument()
      })
    })

    describe('tunnel des listes de diffusion', () => {
      it('conseille à l’utilisateur de sélectionner une liste de diffusion au clic sur ”voir mes listes de diffusion”', async () => {
        //When
        await act(async () => {
          renderWithContexts(<Messagerie pageTitle='' />, {
            customDependances: {
              jeunesService,
              messagesService,
              listesDeDiffusionService,
            },
            customConseiller: {
              structure: StructureConseiller.POLE_EMPLOI,
            },
            customShowRubriqueListeDeDiffusion: { value: true },
          })
        })
        //Then
        expect(
          screen.getByText('Veuillez sélectionner une liste de diffusion.')
        ).toBeInTheDocument()
      })
      describe('quand une liste est sélectionée', () => {
        beforeEach(async () => {
          //Given
          const listeSelectionnee =
            await listesDeDiffusionService.getListesDeDiffusionClientSide()

          //When
          await act(async () => {
            renderWithContexts(<Messagerie pageTitle='' />, {
              customDependances: {
                jeunesService,
                messagesService,
                listesDeDiffusionService,
              },
              customConseiller: {
                structure: StructureConseiller.POLE_EMPLOI,
              },
              customShowRubriqueListeDeDiffusion: { value: true },
              customListeDeDiffusionSelectionnee: { value: listeSelectionnee },
            })
          })
        })

        it('affiche le lien vers la page de modification de la liste si une liste est sélectionnée', async () => {
          expect(
            screen.getByRole('link', {
              name: 'Modifier ma liste',
            })
          ).toBeInTheDocument()
        })
        it('affiche les messages de la liste de diffusion', async () => {
          const messageRandom = await desMessagesListeDeDiffusionParJour()[0]
            .messages[0]
          //Then
          expect(
            screen.getByText('Messages envoyés à la liste de diffusion')
          ).toBeInTheDocument()

          expect(screen.getByText(messageRandom.content)).toBeInTheDocument()
        })
      })
    })
  })
})
