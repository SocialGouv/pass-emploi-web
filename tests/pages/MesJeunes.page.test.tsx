import React from 'react'
import Router from 'next/router'
import { act, fireEvent, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import '@testing-library/jest-dom'
import MesJeunes from 'pages/mes-jeunes/index'
import { unJeune } from 'fixtures/jeune'
import renderWithSession from '../renderWithSession'
import { UserStructure } from 'interfaces/conseiller'
import { DIProvider } from 'utils/injectionDependances'
import { MessagesService } from 'services/messages.service'

jest.mock('next/router')
describe('Mes Jeunes', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('quand le conseiller est MILO', () => {
    let messagesService: MessagesService

    beforeEach(async () => {
      //GIVEN
      const jeune = unJeune()

      messagesService = {
        observeJeuneChat: jest.fn(),
        observeJeuneReadingDate: jest.fn(),
        observeMessages: jest.fn(),
        sendNouveauMessage: jest.fn(),
        setReadByConseiller: jest.fn(),
        signIn: jest.fn(() => Promise.resolve()),
        signOut: jest.fn(),
        countMessagesNotRead: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      }

      await act(async () => {
        renderWithSession(
          <DIProvider dependances={{ messagesService }}>
            <MesJeunes
              structureConseiller={UserStructure.MILO}
              conseillerJeunes={[jeune]}
              isFromEmail
            />
          </DIProvider>
        )
      })
    })

    it('redirige vers la page de création jeune MILO', () => {
      // GIVEN
      const addButton = screen.getByRole('button', {
        name: 'Ajouter un jeune',
      })
      const routerSpy = jest.spyOn(Router, 'push')

      //WHEN
      fireEvent.click(addButton)

      //THEN
      expect(routerSpy).toHaveBeenCalledWith('/mes-jeunes/milo/creation-jeune')
    })
  })

  describe('quand le conseiller est Pole emploi', () => {
    let messagesService: MessagesService

    beforeEach(async () => {
      //GIVEN
      const jeune = unJeune()

      messagesService = {
        observeJeuneChat: jest.fn(),
        observeJeuneReadingDate: jest.fn(),
        observeMessages: jest.fn(),
        sendNouveauMessage: jest.fn(),
        setReadByConseiller: jest.fn(),
        signIn: jest.fn(() => Promise.resolve()),
        signOut: jest.fn(),
        countMessagesNotRead: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      }

      await act(async () => {
        renderWithSession(
          <DIProvider dependances={{ messagesService }}>
            <MesJeunes
              structureConseiller={UserStructure.POLE_EMPLOI}
              conseillerJeunes={[jeune]}
              isFromEmail
            />
          </DIProvider>
        )
      })
    })

    it('devrait rediriger vers la page de création jeune PE', () => {
      // GIVEN
      const addButton = screen.getByRole('button', {
        name: 'Ajouter un jeune',
      })
      const routerSpy = jest.spyOn(Router, 'push')

      //WHEN
      fireEvent.click(addButton)

      //THEN
      expect(routerSpy).toHaveBeenCalledWith(
        '/mes-jeunes/pole-emploi/creation-jeune'
      )
    })
  })
  describe('Contenu de page', () => {
    let messagesService: MessagesService
    messagesService = {
      observeJeuneChat: jest.fn(),
      observeJeuneReadingDate: jest.fn(),
      observeMessages: jest.fn(),
      sendNouveauMessage: jest.fn(),
      setReadByConseiller: jest.fn(),
      signIn: jest.fn(() => Promise.resolve()),
      signOut: jest.fn(),
      countMessagesNotRead: jest
        .fn()
        .mockImplementation(() => Promise.resolve()),
    }

    const jeune1 = unJeune({ id: 'jeune-1' })
    const jeune2 = unJeune({ id: 'jeune-2' })
    const jeune3 = unJeune({ id: 'jeune-3' })

    const jeunes = [jeune1, jeune2, jeune3]

    it('devrait avoir un titre de niveau 1', async () => {
      await act(async () => {
        renderWithSession(
          <DIProvider dependances={{ messagesService }}>
            <MesJeunes
              structureConseiller={UserStructure.MILO}
              conseillerJeunes={jeunes}
              isFromEmail
            />
          </DIProvider>
        )
      })

      //WHEN
      const heading = screen.getByRole('heading', {
        level: 1,
        name: 'Mes Jeunes',
      })

      //THEN
      expect(heading).toBeInTheDocument()
    })

    it("devrait afficher la liste des jeunes s'il en a", async () => {
      //GIVEN
      await act(async () => {
        renderWithSession(
          <DIProvider dependances={{ messagesService }}>
            <MesJeunes
              structureConseiller={UserStructure.MILO}
              conseillerJeunes={jeunes}
              isFromEmail
            />
          </DIProvider>
        )
      })
      //WHEN
      const rows = screen.getAllByRole('row')

      //THEN
      expect(rows.length - 1).toBe(jeunes.length)
      expect(() =>
        screen.getByText("Vous n'avez pas encore intégré de jeunes.")
      ).toThrow()
    })

    it("devrait afficher un message invitant à ajouter des jeunes s'il n’en a pas", async () => {
      //GIVEN
      await act(async () => {
        renderWithSession(
          <DIProvider dependances={{ messagesService }}>
            <MesJeunes
              structureConseiller={UserStructure.MILO}
              conseillerJeunes={[]}
              isFromEmail
            />
          </DIProvider>
        )
      })

      //WHEN
      const addJeuneText = screen.getByText(
        "Vous n'avez pas encore intégré de jeunes."
      )

      //THEN
      expect(addJeuneText).toBeInTheDocument()
      expect(() => screen.getAllByRole('row')).toThrow()
    })
  })
})
