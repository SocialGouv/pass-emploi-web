import '@testing-library/jest-dom'
import '@testing-library/jest-dom/extend-expect'
import { act, fireEvent, screen, within } from '@testing-library/react'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import renderWithSession from '../renderWithSession'

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
import { compareJeunesByLastName } from 'interfaces/jeune'
import { getServerSideProps } from 'pages/mes-jeunes'
import MesJeunes from 'pages/mes-jeunes/index'
import { ActionsService } from 'services/actions.service'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { DIProvider } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('Mes Jeunes', () => {
  describe('client side', () => {
    let push: Function
    let messagesService: MessagesService
    const jeunes = desJeunesAvecActionsNonTerminees()
    beforeEach(() => {
      push = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({ push })

      messagesService = mockedMessagesService({
        signIn: jest.fn(() => Promise.resolve()),
        countMessagesNotRead: jest.fn((_, ids: string[]) =>
          Promise.resolve(
            ids.reduce(
              (mapped, id) => ({ ...mapped, [id]: 2 }),
              {} as { [id: string]: number }
            )
          )
        ),
      })
    })

    describe('Contenu de page', () => {
      beforeEach(async () => {
        // WHEN
        await act(async () => {
          renderWithSession(
            <DIProvider dependances={{ messagesService }}>
              <MesJeunes
                structureConseiller={UserStructure.MILO}
                conseillerJeunes={jeunes}
                isFromEmail
                pageTitle=''
              />
            </DIProvider>
          )
        })
      })

      it("affiche la liste des jeunes s'il en a", async () => {
        //THEN
        expect(screen.getAllByRole('row')).toHaveLength(jeunes.length + 1)
        jeunes.forEach((jeune) => {
          expect(
            screen.getByText(jeune.nbActionsNonTerminees)
          ).toBeInTheDocument()
        })
        expect(screen.getAllByText('2')).toHaveLength(jeunes.length)

        expect(() =>
          screen.getByText("Vous n'avez pas encore intégré de jeunes.")
        ).toThrow()
      })

      it('affiche le message de succès de suppression de jeune', async () => {
        //WHEN
        await act(async () => {
          renderWithSession(
            <DIProvider dependances={{ messagesService }}>
              <MesJeunes
                structureConseiller={UserStructure.MILO}
                conseillerJeunes={jeunes}
                isFromEmail
                deletionSuccess={true}
                pageTitle={''}
              />
            </DIProvider>
          )
        })

        //THEN
        expect(
          screen.getByText('Le compte du jeune a bien été supprimé.')
        ).toBeInTheDocument()
      })

      describe("affiche le statut d'activation du compte d'un jeune", () => {
        it("si le compte n'a pas été activé", () => {
          const row1 = within(
            screen
              .getByText('Jirac Kenji')
              .closest('[role="row"]') as HTMLElement
          )

          //THEN
          expect(row1.getByText('Compte non activé')).toBeInTheDocument()
        })

        it('si le compte a été activé', () => {
          const row2 = within(
            screen
              .getByText('Sanfamiye Nadia')
              .closest('[role="row"]') as HTMLElement
          )

          //THEN
          expect(row2.getByText('Le 30/01/2022 à 18:30')).toBeInTheDocument()
        })
      })
    })

    describe('quand le conseiller est MILO', () => {
      beforeEach(async () => {
        //GIVEN
        const jeune = unJeuneAvecActionsNonTerminees()

        await act(async () => {
          renderWithSession(
            <DIProvider dependances={{ messagesService }}>
              <MesJeunes
                structureConseiller={UserStructure.MILO}
                conseillerJeunes={[jeune]}
                isFromEmail
                pageTitle=''
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

        //WHEN
        fireEvent.click(addButton)

        //THEN
        expect(push).toHaveBeenCalledWith('/mes-jeunes/milo/creation-jeune')
      })

      it("affiche le nombre d'actions des jeunes", () => {
        // Then
        expect(
          screen.getByRole('columnheader', { name: 'Actions' })
        ).toBeInTheDocument()
      })

      it('affiche le message de succès de suppression de jeune', async () => {
        //WHEN
        await act(async () => {
          renderWithSession(
            <DIProvider dependances={{ messagesService }}>
              <MesJeunes
                structureConseiller={UserStructure.MILO}
                conseillerJeunes={jeunes}
                isFromEmail
                deletionSuccess={true}
                pageTitle={''}
              />
            </DIProvider>
          )
        })

        //THEN
        expect(
          screen.getByText('Le compte du jeune a bien été supprimé.')
        ).toBeInTheDocument()
        expect(
          screen.getByRole('link', {
            name: 'support@pass-emploi.beta.gouv.fr',
          })
        ).toBeInTheDocument()
      })
    })

    describe('quand le conseiller est Pole emploi', () => {
      beforeEach(async () => {
        //GIVEN
        const jeune = unJeuneAvecActionsNonTerminees()

        await act(async () => {
          renderWithSession(
            <DIProvider dependances={{ messagesService }}>
              <MesJeunes
                structureConseiller={UserStructure.POLE_EMPLOI}
                conseillerJeunes={[jeune]}
                isFromEmail
                pageTitle=''
              />
            </DIProvider>
          )
        })
      })

      it('redirige vers la page de création jeune PE', () => {
        // GIVEN
        const addButton = screen.getByRole('button', {
          name: 'Ajouter un jeune',
        })

        //WHEN
        fireEvent.click(addButton)

        //THEN
        expect(push).toHaveBeenCalledWith(
          '/mes-jeunes/pole-emploi/creation-jeune'
        )
      })

      it("n'affiche pas le nombre d'actions des jeunes", () => {
        // Then
        expect(() =>
          screen.getByRole('columnheader', { name: 'Actions' })
        ).toThrow()
      })

      it('affiche le message de succès de suppression de jeune', async () => {
        //WHEN
        await act(async () => {
          renderWithSession(
            <DIProvider dependances={{ messagesService }}>
              <MesJeunes
                structureConseiller={UserStructure.POLE_EMPLOI}
                conseillerJeunes={jeunes}
                isFromEmail
                deletionSuccess={true}
                pageTitle={''}
              />
            </DIProvider>
          )
        })

        //THEN
        expect(
          screen.getByText('Le compte du jeune a bien été supprimé.')
        ).toBeInTheDocument()
      })
    })

    describe("quand le conseiller n'a pas de jeune", () => {
      it('affiche un message invitant à ajouter des jeunes', async () => {
        // GIVEN
        await act(async () => {
          renderWithSession(
            <DIProvider dependances={{ messagesService }}>
              <MesJeunes
                structureConseiller={UserStructure.MILO}
                conseillerJeunes={[]}
                isFromEmail
                pageTitle=''
              />
            </DIProvider>
          )
        })

        //THEN
        expect(
          screen.getByText("Vous n'avez pas encore intégré de jeunes.")
        ).toBeInTheDocument()
        expect(() => screen.getAllByRole('row')).toThrow()
      })
    })

    describe('quand la récupération des messages non lus échoue', () => {
      it('affiche la liste des jeunes', async () => {
        // GIVEN
        ;(messagesService.countMessagesNotRead as jest.Mock).mockRejectedValue(
          new Error()
        )

        // WHEN
        await act(async () => {
          renderWithSession(
            <DIProvider dependances={{ messagesService }}>
              <MesJeunes
                structureConseiller={UserStructure.MILO}
                conseillerJeunes={jeunes}
                isFromEmail
                pageTitle=''
              />
            </DIProvider>
          )
        })

        //THEN
        expect(screen.getAllByRole('row')).toHaveLength(jeunes.length + 1)
      })
    })

    describe('quand on vient de selectionner une agence', () => {
      it('affiche un message de succès', async () => {
        // When
        await act(async () => {
          renderWithSession(
            <DIProvider dependances={{ messagesService }}>
              <MesJeunes
                structureConseiller={UserStructure.MILO}
                conseillerJeunes={jeunes}
                isFromEmail
                pageTitle=''
                ajoutAgenceSuccess={true}
              />
            </DIProvider>
          )
        })

        // Then
        expect(
          screen.getByText('Votre Mission locale a été ajoutée à votre profil')
        ).toBeInTheDocument()
      })
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
        countActionsJeunes: jest.fn().mockResolvedValue(
          jeunes.map((j) => ({
            idJeune: j.id,
            nbActionsNonTerminees: 7,
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
        validSession: false,
        redirect: { destination: 'whatever' },
      })

      // When
      const actual = await getServerSideProps({
        query: {},
      } as GetServerSidePropsContext)

      // Then
      expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
      expect(actual).toEqual({ redirect: { destination: 'whatever' } })
    })

    it('récupère la liste des jeunes', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
        session: {
          user: { id: 'id-conseiller', structure: 'POLE_EMPLOI' },
          accessToken: 'accessToken',
        },
      })

      // When
      await getServerSideProps({ query: {} } as GetServerSidePropsContext)

      // Then
      expect(jeunesService.getJeunesDuConseiller).toHaveBeenCalledWith(
        'id-conseiller',
        'accessToken'
      )
    })

    it("traite la réussite d'une suppression de jeune", async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
        session: {
          user: { id: 'id-conseiller', structure: 'POLE_EMPLOI' },
          accessToken: 'accessToken',
        },
      })

      // When
      const actual = await getServerSideProps({
        query: { suppression: 'succes' },
      } as unknown as GetServerSidePropsContext)

      // Then
      expect(actual).toMatchObject({
        props: {
          deletionSuccess: true,
        },
      })
    })

    it('traite la réussite du renseignement de mon agence', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
        session: {
          user: { id: 'id-conseiller', structure: 'POLE_EMPLOI' },
          accessToken: 'accessToken',
        },
      })

      // When
      const actual = await getServerSideProps({
        query: { choixAgence: 'succes' },
      } as unknown as GetServerSidePropsContext)

      // Then
      expect(actual).toMatchObject({
        props: {
          ajoutAgenceSuccess: true,
        },
      })
    })

    describe('pour un conseiller Pole emploi', () => {
      let actual: any
      beforeEach(async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { id: 'id-conseiller', structure: 'POLE_EMPLOI' },
            accessToken: 'accessToken',
          },
        })

        // When
        actual = await getServerSideProps({
          query: {},
        } as GetServerSidePropsContext)
      })

      it('ne récupère pas les actions des jeunes', () => {
        // Then
        expect(actionsService.countActionsJeunes).not.toHaveBeenCalled()
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
          validSession: true,
          session: {
            user: { id: 'id-conseiller', structure: 'MILO' },
            accessToken: 'accessToken',
          },
        })

        // When
        actual = await getServerSideProps({
          query: {},
        } as GetServerSidePropsContext)
      })

      it('récupère les actions des jeunes', () => {
        // Then
        expect(actionsService.countActionsJeunes).toHaveBeenCalledWith(
          'id-conseiller',
          'accessToken'
        )
      })

      it("renvoie les jeunes avec leur nombre d'actions", () => {
        // Then
        expect(actual).toEqual({
          props: {
            conseillerJeunes: desJeunes()
              .map((jeune) => ({
                ...jeune,
                nbActionsNonTerminees: 7,
              }))
              .sort(compareJeunesByLastName),
            structureConseiller: 'MILO',
            pageTitle: 'Mes jeunes',
            isFromEmail: false,
          },
        })
      })
    })
  })
})
