import { act, screen } from '@testing-library/react'
import { DateTime } from 'luxon'
import { GetServerSidePropsResult } from 'next'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { desActionsInitiales, uneAction } from 'fixtures/action'
import { unAgenda } from 'fixtures/agenda'
import { dateFuture, dateFutureLoin, datePasseeLoin, now } from 'fixtures/date'
import { unEvenementListItem } from 'fixtures/evenement'
import {
  desConseillersJeune,
  desIndicateursSemaine,
  unDetailJeune,
  uneMetadonneeFavoris,
} from 'fixtures/jeune'
import {
  mockedActionsService,
  mockedAgendaService,
  mockedEvenementsService,
  mockedJeunesService,
} from 'fixtures/services'
import { StructureConseiller } from 'interfaces/conseiller'
import FicheJeune, {
  getServerSideProps,
  Onglet,
} from 'pages/mes-jeunes/[jeune_id]'
import { ActionsService } from 'services/actions.service'
import { EvenementsService } from 'services/evenements.service'
import { JeunesService } from 'services/jeunes.service'
import renderWithContexts from 'tests/renderWithContexts'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('Fiche Jeune', () => {
  describe('client side', () => {
    describe('pour tous les conseillers', () => {
      it('modifie le currentJeune', async () => {
        // Given
        let setIdJeune = jest.fn()

        // When
        await act(async () => {
          await renderWithContexts(
            <FicheJeune
              jeune={unDetailJeune()}
              rdvs={[]}
              actionsInitiales={desActionsInitiales()}
              pageTitle={''}
            />,
            {
              customDependances: {
                jeunesService: mockedJeunesService({
                  getIndicateursJeuneAlleges: jest.fn(async () =>
                    desIndicateursSemaine()
                  ),
                }),
                agendaService: mockedAgendaService({
                  recupererAgenda: jest.fn(async () => unAgenda()),
                }),
              },
              customCurrentJeune: { idSetter: setIdJeune },
            }
          )
        })

        // Then
        expect(setIdJeune).toHaveBeenCalledWith('jeune-1')
      })
    })

    describe('pour les conseillers MILO', () => {
      it('affiche un lien pour accéder aux calendrier de l’établissement', async () => {
        // Given
        let setIdJeune = jest.fn()

        await act(async () => {
          await renderWithContexts(
            <FicheJeune
              jeune={unDetailJeune()}
              rdvs={[]}
              actionsInitiales={desActionsInitiales()}
              pageTitle={''}
            />,
            {
              customConseiller: { structure: StructureConseiller.MILO },
              customDependances: {
                jeunesService: mockedJeunesService({
                  getIndicateursJeune: jest.fn(async () =>
                    desIndicateursSemaine()
                  ),
                }),
                agendaService: mockedAgendaService({
                  recupererAgenda: jest.fn(async () => unAgenda()),
                }),
              },
              customCurrentJeune: { idSetter: setIdJeune },
            }
          )
        })

        // Then
        expect(
          screen.getByRole('link', {
            name: 'Voir le calendrier de l’établissement',
          })
        ).toHaveAttribute('href', '/agenda?onglet=etablissement')
      })
    })
  })

  describe('server side', () => {
    const rdvAVenir = unEvenementListItem({
      date: DateTime.now().plus({ day: 1 }).toISO(),
    })
    let jeunesService: JeunesService
    let evenementsService: EvenementsService
    let actionsService: ActionsService
    beforeEach(() => {
      jeunesService = mockedJeunesService({
        getJeuneDetails: jest.fn(async () => unDetailJeune()),
        getConseillersDuJeuneServerSide: jest.fn(async () =>
          desConseillersJeune()
        ),
        getMetadonneesFavorisJeune: jest.fn(async () => uneMetadonneeFavoris()),
      })
      evenementsService = mockedEvenementsService({
        getRendezVousJeune: jest.fn(async () => [rdvAVenir]),
      })
      actionsService = mockedActionsService({
        getActionsJeuneServerSide: jest.fn(async () => ({
          actions: [
            uneAction({ creationDate: now.toISO() }),
            uneAction({ creationDate: datePasseeLoin.toISO() }),
            uneAction({ creationDate: dateFuture.toISO() }),
            uneAction({ creationDate: dateFutureLoin.toISO() }),
          ],
          metadonnees: { nombreTotal: 14, nombrePages: 2 },
        })),
      })
      ;(withDependance as jest.Mock).mockImplementation((dependance) => {
        if (dependance === 'jeunesService') return jeunesService
        if (dependance === 'evenementsService') return evenementsService
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
          session: {
            accessToken: 'accessToken',
            user: { id: 'id-conseiller', structure: 'MILO' },
          },
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
        expect(actual).toEqual({
          props: {
            jeune: unDetailJeune(),
            pageTitle: 'Portefeuille - Kenji Jirac',
            pageHeader: 'Kenji Jirac',
            rdvs: expect.arrayContaining([]),
            actionsInitiales: expect.arrayContaining([]),
            metadonneesFavoris: expect.arrayContaining([]),
          },
        })
      })

      it('récupère les rendez-vous à venir du jeune', async () => {
        // Then
        expect(evenementsService.getRendezVousJeune).toHaveBeenCalledWith(
          'id-jeune',
          'FUTURS',
          'accessToken'
        )
        expect(actual).toMatchObject({
          props: { rdvs: [rdvAVenir] },
        })
      })

      it('récupère les favoris', async () => {
        // Then
        expect(jeunesService.getMetadonneesFavorisJeune).toHaveBeenCalledWith(
          'id-jeune',
          'accessToken'
        )
        expect(actual).toMatchObject({
          props: { metadonneesFavoris: uneMetadonneeFavoris() },
        })
      })

      it('récupère la première page des actions du jeune', async () => {
        // Then
        expect(actionsService.getActionsJeuneServerSide).toHaveBeenCalledWith(
          'id-jeune',
          1,
          'accessToken'
        )
        expect(actual).toMatchObject({
          props: {
            actionsInitiales: {
              actions: [
                uneAction({ creationDate: now.toISO() }),
                uneAction({ creationDate: datePasseeLoin.toISO() }),
                uneAction({ creationDate: dateFuture.toISO() }),
                uneAction({ creationDate: dateFutureLoin.toISO() }),
              ],
              page: 1,
              metadonnees: { nombreTotal: 14, nombrePages: 2 },
            },
          },
        })
      })
    })

    describe('Quand on demande une page d’actions spécifique', () => {
      it('récupère la page demandée des actions du jeune', async () => {
        // When
        const actual = await getServerSideProps({
          query: { jeune_id: 'id-jeune', page: 3 },
        } as unknown as GetServerSidePropsContext)
        // Then
        expect(actionsService.getActionsJeuneServerSide).toHaveBeenCalledWith(
          'id-jeune',
          3,
          'accessToken'
        )
        expect(actual).toMatchObject({
          props: {
            actionsInitiales: {
              page: 3,
            },
          },
        })
      })
    })

    describe('Quand on vient du détail d’une action', () => {
      it('récupère l’onglet sur lequel ouvrir la page', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
          session: {
            accessToken: 'accessToken',
            user: { structure: 'MILO' },
          },
          validSession: true,
        })

        // When
        const actual = await getServerSideProps({
          query: { onglet: 'actions' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({ props: { onglet: Onglet.ACTIONS } })
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
        expect(evenementsService.getRendezVousJeune).not.toHaveBeenCalled()
        expect(actual).toMatchObject({ props: { rdvs: [] } })
      })

      it('ne recupère pas les actions', async () => {
        // Then
        expect(actionsService.getActionsJeuneServerSide).not.toHaveBeenCalled()
        expect(actual).toMatchObject({
          props: { actionsInitiales: { actions: [] } },
        })
      })
    })
  })
})
