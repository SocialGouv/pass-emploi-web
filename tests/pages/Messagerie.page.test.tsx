import { act, screen } from '@testing-library/react'
import React from 'react'

import { desItemsJeunes, extractBaseJeune, unJeuneChat } from 'fixtures/jeune'
import { desListesDeDiffusion } from 'fixtures/listes-de-diffusion'
import { desMessagesListeDeDiffusionParJour } from 'fixtures/message'
import { StructureConseiller } from 'interfaces/conseiller'
import { BaseJeune, ConseillerHistorique, JeuneChat } from 'interfaces/jeune'
import { ByDay, MessageListeDiffusion } from 'interfaces/message'
import Messagerie from 'pages/messagerie'
import { getConseillersDuJeuneClientSide } from 'services/jeunes.service'
import { getListesDeDiffusionClientSide } from 'services/listes-de-diffusion.service'
import {
  getMessagesListeDeDiffusion,
  observeConseillerChats,
} from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/jeunes.service')
jest.mock('services/messages.service')
jest.mock('services/listes-de-diffusion.service')

describe('Messagerie', () => {
  describe('client side', () => {
    const jeunes: BaseJeune[] = desItemsJeunes().map(extractBaseJeune)
    let jeunesChats: JeuneChat[]

    let conseillers: ConseillerHistorique[]
    let updateChatsRef: (chats: JeuneChat[]) => void
    let messages: ByDay<MessageListeDiffusion>[]

    beforeEach(async () => {
      ;(getConseillersDuJeuneClientSide as jest.Mock).mockResolvedValue(
        conseillers
      )
      messages = desMessagesListeDeDiffusionParJour()
      ;(observeConseillerChats as jest.Mock).mockImplementation(
        (jeune, _cle, fn) => {
          updateChatsRef = fn
          updateChatsRef(jeunesChats)
          return Promise.resolve(() => {})
        }
      )
      ;(getMessagesListeDeDiffusion as jest.Mock).mockResolvedValue(messages)
      ;(getListesDeDiffusionClientSide as jest.Mock).mockResolvedValue(
        desListesDeDiffusion()
      )
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
          const listeSelectionnee = desListesDeDiffusion()[0]

          //When
          await act(async () => {
            renderWithContexts(<Messagerie pageTitle='' />, {
              customConseiller: {
                structure: StructureConseiller.POLE_EMPLOI,
              },
              customShowRubriqueListeDeDiffusion: { value: true },
              customListeDeDiffusionSelectionnee: {
                value: listeSelectionnee,
              },
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
