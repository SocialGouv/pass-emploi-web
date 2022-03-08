import '@testing-library/jest-dom'
import '@testing-library/jest-dom/extend-expect'
import { act, fireEvent, screen } from '@testing-library/react'
import {
  desJeunes,
  desJeunesAvecActionsNonTerminees,
  unJeuneAvecActionsNonTerminees,
} from 'fixtures/jeune'
import {
  mockedActionsService,
  mockedJeunesService,
  mockedMessagesService,
} from 'fixtures/services'
import { UserStructure } from 'interfaces/conseiller'
import Router from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import { getServerSideProps } from 'pages/mes-jeunes'
import MesJeunes from 'pages/mes-jeunes/index'
import React from 'react'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import { DIProvider } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import { compareJeunesByLastName } from '../../interfaces/jeune'
import { ActionsService } from '../../services/actions.service'
import renderWithSession from '../renderWithSession'

jest.mock('next/router')
jest.mock('utils/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('Mes Jeunes', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('quand le conseiller est MILO', () => {
    let messagesService: MessagesService

    beforeEach(async () => {
      //GIVEN
      const jeune = unJeuneAvecActionsNonTerminees()

      messagesService = mockedMessagesService({
        signIn: jest.fn(() => Promise.resolve()),
        countMessagesNotRead: jest.fn(() => Promise.resolve(0)),
      })

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

    it("affiche le nombre d'actions des jeunes", () => {
      // Then
      expect(
        screen.getByRole('columnheader', { name: 'Actions' })
      ).toBeInTheDocument()
    })
  })

  describe('quand le conseiller est Pole emploi', () => {
    let messagesService: MessagesService

    beforeEach(async () => {
      //GIVEN
      const jeune = unJeuneAvecActionsNonTerminees()

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

    it("n'affiche pas le nombre d'actions des jeunes", () => {
      // Then
      expect(() =>
        screen.getByRole('columnheader', { name: 'Actions' })
      ).toThrow()
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

    const jeunes = desJeunesAvecActionsNonTerminees()

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
      jeunes.forEach((jeune) => {
        expect(
          screen.getByText(`${jeune.nbActionsNonTerminees}`)
        ).toBeInTheDocument()
      })
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

  describe('server side', () => {
    let jeunesService: JeunesService
    let actionsService: ActionsService
    beforeEach(() => {
      const jeunes = desJeunes()
      jeunesService = mockedJeunesService({
        getJeunesDuConseiller: jest.fn().mockResolvedValue(jeunes),
      })
      actionsService = mockedActionsService({
        getActions: jest.fn().mockResolvedValue(
          jeunes.map((j) => ({
            jeuneId: j.id,
            inProgressActionsCount: 2,
            todoActionsCount: 5,
          }))
        ),
      })
      ;(withDependance as jest.Mock).mockImplementation((dependance) => {
        if (dependance === 'jeunesService') return jeunesService
        if (dependance === 'actionsService') return actionsService
      })
    })

    it("vérifie qu'il y a un utilisateur connecté", async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        hasSession: false,
        redirect: { destination: 'whatever' },
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
      expect(actual).toEqual({ redirect: { destination: 'whatever' } })
    })

    it('récupère la liste des jeunes', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        hasSession: true,
        session: {
          user: { id: 'id-conseiller', structure: 'POLE_EMPLOI' },
          accessToken: 'accessToken',
        },
      })

      // When
      await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(jeunesService.getJeunesDuConseiller).toHaveBeenCalledWith(
        'id-conseiller',
        'accessToken'
      )
    })

    describe('pour un conseiller Pole emploi', () => {
      let actual: any
      beforeEach(async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          hasSession: true,
          session: {
            user: { id: 'id-conseiller', structure: 'POLE_EMPLOI' },
            accessToken: 'accessToken',
          },
        })

        // When
        actual = await getServerSideProps({} as GetServerSidePropsContext)
      })

      it('ne récupère pas les actions des jeunes', () => {
        // Then
        expect(actionsService.getActions).not.toHaveBeenCalled()
      })

      it("renvoie les jeunes sans leur nombre d'actions", () => {
        // Then
        expect(actual).toMatchObject({
          props: {
            conseillerJeunes: desJeunes()
              .map((jeune) => ({
                ...jeune,
                nbActionsNonTerminees: 0,
              }))
              .sort(compareJeunesByLastName),
          },
        })
      })
    })

    describe('pour un conseiller pas Pole emploi', () => {
      let actual: any
      beforeEach(async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          hasSession: true,
          session: {
            user: { id: 'id-conseiller', structure: 'MILO' },
            accessToken: 'accessToken',
          },
        })

        // When
        actual = await getServerSideProps({} as GetServerSidePropsContext)
      })

      it('récupère les actions des jeunes', () => {
        // Then
        expect(actionsService.getActions).toHaveBeenCalledWith(
          'id-conseiller',
          'accessToken'
        )
      })

      it("renvoie les jeunes avec leur nombre d'actions", () => {
        // Then
        expect(actual).toMatchObject({
          props: {
            conseillerJeunes: desJeunes()
              .map((jeune) => ({
                ...jeune,
                nbActionsNonTerminees: 7,
              }))
              .sort(compareJeunesByLastName),
          },
        })
      })
    })
  })
})
