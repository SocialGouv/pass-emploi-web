import { act, screen } from '@testing-library/react'
import { DateTime } from 'luxon'
import { GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import renderWithSession from '../renderWithSession'

import { uneAction, uneListeDActions } from 'fixtures/action'
import { dateFuture, dateFutureLoin, datePasseeLoin, now } from 'fixtures/date'
import {
  desConseillersJeune,
  unConseillerHistorique,
  unJeune,
} from 'fixtures/jeune'
import {
  desRdvListItems,
  uneListeDeRdv,
  unRendezVous,
} from 'fixtures/rendez-vous'
import {
  mockedActionsService,
  mockedJeunesService,
  mockedRendezVousService,
} from 'fixtures/services'
import { UserStructure } from 'interfaces/conseiller'
import { ConseillerHistorique } from 'interfaces/jeune'
import { rdvToListItem } from 'interfaces/rdv'
import FicheJeune, { getServerSideProps } from 'pages/mes-jeunes/[jeune_id]'
import { ActionsService } from 'services/actions.service'
import { JeunesService } from 'services/jeunes.service'
import { RendezVousService } from 'services/rendez-vous.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { CurrentJeuneProvider } from 'utils/chat/currentJeuneContext'
import { DIProvider } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    asPath: '/mes-jeunes/jeune-1',
  })),
}))
jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('Fiche Jeune', () => {
  describe('client side', () => {
    const jeune = unJeune()
    const rdvs = desRdvListItems()
    const actions = uneListeDActions()
    const listeConseillers = desConseillersJeune()

    let jeunesService: JeunesService
    let rendezVousService: RendezVousService
    beforeEach(async () => {
      jeunesService = mockedJeunesService()
      rendezVousService = mockedRendezVousService()
    })

    describe("quand l'utilisateur n'est pas un conseiller Pole emploi", () => {
      let setJeune: () => void
      beforeEach(async () => {
        // Given
        setJeune = jest.fn()

        // When
        renderWithSession(<DIProvider dependances={ { jeunesService, rendezVousService } }>
            <CurrentJeuneProvider setJeune={ setJeune }>
                <FicheJeune
                        jeune={ jeune }
                        rdvs={ rdvs }
                        actions={ actions }
                        conseillers={ listeConseillers }
                        pageTitle={ '' }
                />
            </CurrentJeuneProvider>
        </DIProvider>)
      })

      it('affiche le titre de la fiche', async () => {
        // Then
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
          'Kenji Jirac'
        )
      })

      it('affiche la liste des rendez-vous du jeune', async () => {
        // Then
        rdvs.forEach((rdv) => {
          expect(screen.getByText(rdv.type)).toBeInTheDocument()
          expect(screen.getByText(rdv.modality)).toBeInTheDocument()
        })
      })

      it('affiche un lien vers les actions du jeune', async () => {
        // Then
        const lienActions = screen.getByRole('link', {
          name: 'Voir la liste des actions du jeune',
        })
        expect(lienActions).toBeInTheDocument()
        expect(lienActions).toHaveAttribute(
          'href',
          `/mes-jeunes/${jeune.id}/actions`
        )
      })

      it('affiche les actions du jeune', async () => {
        actions.forEach((action) => {
          expect(screen.getByText(action.content)).toBeInTheDocument()
        })
      })

      it('permet la prise de rendez-vous', async () => {
        // Then
        expect(screen.getByText('Fixer un rendez-vous')).toBeInTheDocument()
      })

      it('affiche la liste des 5 premiers conseillers du jeune', () => {
        // Then
        listeConseillers
          .slice(0, 5)
          .forEach(({ nom, prenom }: ConseillerHistorique) => {
            expect(screen.getByText(`${nom} ${prenom}`)).toBeInTheDocument()
          })
        expect(() => screen.getByText(listeConseillers[5].nom)).toThrow()
      })

      it('affiche un bouton pour dérouler la liste complète des conseillers du jeune', async () => {
        // Then
        const button = screen.getByRole('button', {
          name: 'Voir l’historique complet',
        })
        expect(listeConseillers.length).toEqual(6)
        expect(button).toBeInTheDocument()
      })

      it('permet d’afficher la liste complète des conseillers du jeune', async () => {
        // Given
        const button = screen.getByRole('button', {
          name: 'Voir l’historique complet',
        })

        // When
        act(() => {
          button.click()
        })

        //Then
        listeConseillers.forEach(({ nom, prenom }: ConseillerHistorique) => {
          expect(screen.getByText(`${nom} ${prenom}`)).toBeInTheDocument()
        })
      })

      it('modifie le currentJeune', () => {
        // Then
        expect(setJeune).toHaveBeenCalledWith(jeune)
      })
    })

    describe('quand il y a moins de 5 conseillers dans l’historique', () => {
      const conseillers = [unConseillerHistorique()]
      let setJeune: () => void

      beforeEach(() => {
        setJeune = jest.fn()

        // Given
        renderWithSession(<DIProvider dependances={ { jeunesService, rendezVousService } }>
            <CurrentJeuneProvider setJeune={ setJeune }>
                <FicheJeune
                        jeune={ jeune }
                        rdvs={ rdvs }
                        actions={ actions }
                        conseillers={ conseillers }
                        pageTitle={ '' }
                />
            </CurrentJeuneProvider>
        </DIProvider>)
      })

      it('n’affiche pas de bouton pour dérouler', async () => {
        // Then
        expect(conseillers.length).toEqual(1)
        expect(() => screen.getByText('Voir l’historique complet')).toThrow()
      })
    })

    describe("quand l'utilisateur est un conseiller Pole emploi", () => {
      beforeEach(async () => {
        // When
        renderWithSession(<DIProvider dependances={ { jeunesService, rendezVousService } }>
            <CurrentJeuneProvider>
                <FicheJeune
                        jeune={ jeune }
                        rdvs={ [] }
                        actions={ actions }
                        conseillers={ [] }
                        pageTitle={ '' }
                />
            </CurrentJeuneProvider>
        </DIProvider>, {
            user: {
                id: 'idConseiller',
                name: 'Tavernier',
                email: 'fake@email.fr',
                structure: UserStructure.POLE_EMPLOI,
                estConseiller: true,
                estSuperviseur: false
            }
        })
      })

      it("n'affiche pas la liste des rendez-vous du jeune", async () => {
        // Then
        expect(
          screen.getByText(
            'Gérez les convocations de ce jeune depuis vos outils Pôle emploi.'
          )
        ).toBeInTheDocument()
      })

      it("n'affiche pas de lien vers les actions du jeune", async () => {
        // Then
        expect(() =>
          screen.getByRole('link', {
            name: 'Voir la liste des actions du jeune',
          })
        ).toThrow()
        expect(
          screen.getByText(
            'Gérez les actions et démarches de ce jeune depuis vos outils Pôle emploi.'
          )
        ).toBeInTheDocument()
      })

      it('ne permet pas la prise de rendez-vous', async () => {
        // Then
        expect(() => screen.getByText('Fixer un rendez-vous')).toThrow()
      })
    })

    it('affiche un lien d acces à la page d action quand le jeune n a pas d action', async () => {
      renderWithSession(<DIProvider dependances={ { jeunesService, rendezVousService } }>
          <CurrentJeuneProvider>
              <FicheJeune
                      jeune={ jeune }
                      rdvs={ rdvs }
                      actions={ [] }
                      conseillers={ [] }
                      pageTitle={ '' }
              />
          </CurrentJeuneProvider>
      </DIProvider>)
        expect(
        screen.getByRole('link', {
          name: 'Accédez à cette page pour créer une action',
        })
      ).toBeInTheDocument()
    })

    describe('quand la création de rdv est réussie', () => {
      let replace: jest.Mock
      beforeEach(() => {
        // Given
        replace = jest.fn(() => Promise.resolve())
        ;(useRouter as jest.Mock).mockReturnValue({ replace })

        // When
        renderWithSession(<DIProvider dependances={ { jeunesService, rendezVousService } }>
            <CurrentJeuneProvider>
                <FicheJeune
                        jeune={ jeune }
                        rdvs={ rdvs }
                        actions={ actions }
                        rdvCreationSuccess={ true }
                        conseillers={ [] }
                        pageTitle={ '' }
                />
            </CurrentJeuneProvider>
        </DIProvider>)
      })

      it('affiche un message de succès', () => {
        // Then
        expect(
          screen.getByText('Le rendez-vous a bien été créé')
        ).toBeInTheDocument()
      })

      it('permet de cacher le message de succès', async () => {
        // Given
        const fermerMessage = screen.getByRole('button', {
          name: "J'ai compris",
        })

        // When
        await act(async () => fermerMessage.click())

        // Then
        expect(() =>
          screen.getByText('Le rendez-vous a bien été créé')
        ).toThrow()
        expect(replace).toHaveBeenCalledWith(
          { pathname: '/mes-jeunes/jeune-1' },
          undefined,
          { shallow: true }
        )
      })
    })
    describe('quand la modification de rdv est réussie', () => {
      let replace: jest.Mock
      beforeEach(() => {
        // Given
        replace = jest.fn(() => Promise.resolve())
        ;(useRouter as jest.Mock).mockReturnValue({ replace })

        // When
        renderWithSession(<DIProvider dependances={ { jeunesService, rendezVousService } }>
            <CurrentJeuneProvider>
                <FicheJeune
                        jeune={ jeune }
                        rdvs={ rdvs }
                        conseillers={ [] }
                        actions={ actions }
                        rdvModificationSuccess={ true }
                        pageTitle={ '' }
                />
            </CurrentJeuneProvider>
        </DIProvider>)
      })

      it('affiche un message de succès', () => {
        // Then
        expect(
          screen.getByText('Le rendez-vous a bien été modifié')
        ).toBeInTheDocument()
      })

      it('permet de cacher le message de succès', async () => {
        // Given
        const fermerMessage = screen.getByRole('button', {
          name: "J'ai compris",
        })

        // When
        await act(async () => fermerMessage.click())

        // Then
        expect(() =>
          screen.getByText('Le rendez-vous a bien été modifié')
        ).toThrow()
        expect(replace).toHaveBeenCalledWith(
          { pathname: '/mes-jeunes/jeune-1' },
          undefined,
          { shallow: true }
        )
      })
    })
  })

  describe('server side', () => {
    const rdvAVenir = unRendezVous({
      date: DateTime.now().plus({ day: 1 }).toISO(),
    })
    let jeunesService: JeunesService
    let rendezVousService: RendezVousService
    let actionsService: ActionsService
    beforeEach(() => {
      jeunesService = mockedJeunesService({
        getJeuneDetails: jest.fn(async () => unJeune()),
        getConseillersDuJeune: jest.fn(async () => desConseillersJeune()),
      })
      rendezVousService = mockedRendezVousService({
        getRendezVousJeune: jest.fn(async () =>
          uneListeDeRdv().concat(rdvAVenir)
        ),
      })
      actionsService = mockedActionsService({
        getActionsJeune: jest.fn(async () => [
          uneAction({ creationDate: now.toISOString() }),
          uneAction({ creationDate: datePasseeLoin.toISOString() }),
          uneAction({ creationDate: dateFuture.toISOString() }),
          uneAction({ creationDate: dateFutureLoin.toISOString() }),
        ]),
      })
      ;(withDependance as jest.Mock).mockImplementation((dependance) => {
        if (dependance === 'jeunesService') return jeunesService
        if (dependance === 'rendezVousService') return rendezVousService
        if (dependance === 'actionsService') return actionsService
      })
    })

    describe('Quand la session est invalide', () => {
      it('redirige', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
          redirect: 'whatever',
          validSession: false,
        })

        // When
        const actual = await getServerSideProps({} as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({ redirect: 'whatever' })
      })
    })

    describe('Quand la session est valide', () => {
      let actual: GetServerSidePropsResult<any>
      beforeEach(async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
          session: { accessToken: 'accessToken', user: { structure: 'MILO' } },
          validSession: true,
        })

        // When
        actual = await getServerSideProps({
          query: { jeune_id: 'id-jeune' },
        } as unknown as GetServerSidePropsContext)
      })

      it('récupère les infos du jeune', async () => {
        // Then
        expect(jeunesService.getJeuneDetails).toHaveBeenCalledWith(
          'id-jeune',
          'accessToken'
        )
        expect(actual).toMatchObject({ props: { jeune: unJeune() } })
      })

      it('récupère les rendez-vous à venir du jeune', async () => {
        // Then
        expect(rendezVousService.getRendezVousJeune).toHaveBeenCalledWith(
          'id-jeune',
          'accessToken'
        )
        expect(actual).toMatchObject({
          props: { rdvs: [rdvToListItem(rdvAVenir)] },
        })
      })

      it('récupère les 3 premieres actions du jeune', async () => {
        // Then
        expect(actionsService.getActionsJeune).toHaveBeenCalledWith(
          'id-jeune',
          'accessToken'
        )
        expect(actual).toMatchObject({
          props: {
            actions: [
              uneAction({ creationDate: dateFutureLoin.toISOString() }),
              uneAction({ creationDate: dateFuture.toISOString() }),
              uneAction({ creationDate: now.toISOString() }),
            ],
          },
        })
      })

      it('récupère les conseillers du jeune', async () => {
        // Then
        expect(jeunesService.getConseillersDuJeune).toHaveBeenCalledWith(
          'id-jeune',
          'accessToken'
        )
        expect(actual).toMatchObject({
          props: { conseillers: desConseillersJeune() },
        })
      })
    })

    describe('Quand on vient de créer un rendez-vous', () => {
      it('récupère le statut de la création', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
          session: { accessToken: 'accessToken', user: { structure: 'MILO' } },
          validSession: true,
        })

        // When
        const actual = await getServerSideProps({
          query: { creationRdv: 'succes' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({ props: { rdvCreationSuccess: true } })
      })
    })

    describe('Quand on vient de modifier un rendez-vous', () => {
      it('récupère le statut de la modification', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
          session: { accessToken: 'accessToken', user: { structure: 'MILO' } },
          validSession: true,
        })

        // When
        const actual = await getServerSideProps({
          query: { modificationRdv: 'succes' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({
          props: { rdvModificationSuccess: true },
        })
      })
    })

    describe("Quand on vient d'envoyer un message groupé", () => {
      it("récupère le statut de l'envoi", async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
          session: { accessToken: 'accessToken', user: { structure: 'MILO' } },
          validSession: true,
        })

        // When
        const actual = await getServerSideProps({
          query: { envoiMessage: 'succes' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({
          props: { messageEnvoiGroupeSuccess: true },
        })
      })
    })

    describe('Quand le conseiller est Pole emploi', () => {
      let actual: GetServerSidePropsResult<any>
      beforeEach(async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
          session: { user: { structure: 'POLE_EMPLOI' } },
          validSession: true,
        })

        // When
        actual = await getServerSideProps({
          query: {},
        } as unknown as GetServerSidePropsContext)
      })

      it('ne recupère pas les rendez-vous', async () => {
        // Then
        expect(rendezVousService.getRendezVousJeune).not.toHaveBeenCalled()
        expect(actual).toMatchObject({ props: { rdvs: [] } })
      })

      it('ne recupère pas les actions', async () => {
        // Then
        expect(actionsService.getActionsJeune).not.toHaveBeenCalled()
        expect(actual).toMatchObject({ props: { actions: [] } })
      })
    })
  })
})
