import { screen } from '@testing-library/react'
import React from 'react'

import { desItemsJeunes, extractBaseJeune, unJeuneChat } from 'fixtures/jeune'
import { desListesDeDiffusion } from 'fixtures/listes-de-diffusion'
import {
  mockedJeunesService,
  mockedListesDeDiffusionService,
  mockedMessagesService,
} from 'fixtures/services'
import { StructureConseiller } from 'interfaces/conseiller'
import { BaseJeune, ConseillerHistorique, JeuneChat } from 'interfaces/jeune'
import Favoris from 'pages/mes-jeunes/[jeune_id]/favoris'
import Messagerie, { getServerSideProps } from 'pages/messagerie'
import { JeunesService } from 'services/jeunes.service'
import { ListesDeDiffusionService } from 'services/listes-de-diffusion.service'
import { MessagesService } from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'
import { ListeDeDiffusionSelectionneeProvider } from 'utils/chat/listeDeDiffusionSelectionneeContext'
import { ShowRubriqueListeDeDiffusionProvider } from 'utils/chat/showRubriqueListeDeDiffusionContext'

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
    beforeEach(async () => {
      jeunesService = mockedJeunesService({
        getConseillersDuJeuneClientSide: jest.fn((_) =>
          Promise.resolve(conseillers)
        ),
      })
      messagesService = mockedMessagesService()
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
      ]

      await renderWithContexts(<Messagerie pageTitle='' />, {
        customDependances: {
          jeunesService,
          messagesService,
          listesDeDiffusionService,
        },
        customConseiller: {
          structure: StructureConseiller.POLE_EMPLOI,
        },
        customListeDeDiffusionSelectionnee: undefined,
        customShowRubriqueListeDeDiffusion: undefined,
      })
    })

    it('affiche un message de bienvenue au landing sur la page', async () => {
      //Then
      expect(
        screen.getByText('Bienvenue dans votre espace de messagerie.')
      ).toBeInTheDocument()
    })
  })
})
