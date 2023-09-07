import { act, screen } from '@testing-library/react'
import { DateTime } from 'luxon'
import { GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { desActionsInitiales, uneAction } from 'fixtures/action'
import { unAgenda } from 'fixtures/agenda'
import { unConseiller } from 'fixtures/conseiller'
import { dateFuture, dateFutureLoin, datePasseeLoin, now } from 'fixtures/date'
import { unEvenementListItem } from 'fixtures/evenement'
import { uneListeDeRecherches, uneListeDOffres } from 'fixtures/favoris'
import {
  desConseillersJeune,
  desIndicateursSemaine,
  unDetailJeune,
  uneMetadonneeFavoris,
} from 'fixtures/jeune'
import { StructureConseiller } from 'interfaces/conseiller'
import { Offre, Recherche } from 'interfaces/favoris'
import { MetadonneesFavoris } from 'interfaces/jeune'
import FicheJeune, {
  getServerSideProps,
  Onglet,
} from 'pages/mes-jeunes/[jeune_id]'
import { getActionsJeuneServerSide } from 'services/actions.service'
import { recupererAgenda } from 'services/agenda.service'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getRendezVousJeune } from 'services/evenements.service'
import { getOffres } from 'services/favoris.service'
import {
  getConseillersDuJeuneServerSide,
  getIndicateursJeuneAlleges,
  getJeuneDetails,
  getMetadonneesFavorisJeune,
  getSessionsMiloJeune,
} from 'services/jeunes.service'
import renderWithContexts from 'tests/renderWithContexts'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/jeunes.service')
jest.mock('services/agenda.service')
jest.mock('services/evenements.service')
jest.mock('services/actions.service')
jest.mock('services/favoris.service')
jest.mock('services/conseiller.service')

describe('Fiche Jeune', () => {
  describe('client side', () => {
    beforeEach(async () => {
      ;(useRouter as jest.Mock).mockReturnValue({ asPath: '/mes-jeunes' })
      ;(getIndicateursJeuneAlleges as jest.Mock).mockResolvedValue(
        desIndicateursSemaine()
      )
      ;(recupererAgenda as jest.Mock).mockResolvedValue(unAgenda())
    })

    describe('pour tous les conseillers', () => {
      it('modifie le currentJeune', async () => {
        // Given
        const setIdJeune = jest.fn()
        const jeune = unDetailJeune()

        // When
        await act(async () => {
          await renderWithContexts(
            <FicheJeune
              jeune={jeune}
              rdvs={[]}
              actionsInitiales={desActionsInitiales()}
              pageTitle={''}
            />,
            {
              customCurrentJeune: { idSetter: setIdJeune },
              customConseiller: { id: jeune.idConseiller },
            }
          )
        })

        // Then
        expect(setIdJeune).toHaveBeenCalledWith('jeune-1')
      })
    })

    describe('pour les conseillers non référent', () => {
      let setIdJeune: (id: string | undefined) => void
      beforeEach(async () => {
        // Given
        setIdJeune = jest.fn()

        // When
        await act(async () => {
          await renderWithContexts(
            <FicheJeune
              jeune={unDetailJeune()}
              rdvs={[]}
              actionsInitiales={desActionsInitiales()}
              pageTitle={''}
              lectureSeule={true}
            />,
            {
              customConseiller: { id: 'fake-id' },
              customCurrentJeune: { idSetter: setIdJeune },
            }
          )
        })
      })

      it('ne modifie pas le currentJeune', async () => {
        //Then
        expect(setIdJeune).not.toHaveBeenCalled()
      })

      it('restreint l‘accès aux boutons', async () => {
        //Then
        expect(
          screen.queryByRole('button', { name: 'Supprimer ce compte' })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('link', { name: 'Créer un rendez-vous' })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('link', { name: 'Créer une action' })
        ).not.toBeInTheDocument()
      })

      it('affiche un encart lecture seule', async () => {
        //Then
        expect(
          screen.getByText('Vous êtes en lecture seule')
        ).toBeInTheDocument()
        expect(
          screen.getByText(
            'Vous pouvez uniquement lire la fiche de ce bénéficiaire car il ne fait pas partie de votre portefeuille.'
          )
        ).toBeInTheDocument()
      })
    })

    describe('pour les conseillers non Pôle Emploi', () => {
      it('affiche un lien pour accéder au calendrier de l’établissement', async () => {
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
              customConseiller: { structure: StructureConseiller.MILO },
            }
          )
        })

        // Then
        expect(
          screen.getByRole('link', {
            name: 'Inscrire à une animation collective',
          })
        ).toHaveAttribute('href', '/agenda?onglet=etablissement')
      })
    })

    describe('pour les conseillers non Milo', () => {
      let offresPE: Offre[],
        recherchesPE: Recherche[],
        metadonneesFavoris: MetadonneesFavoris
      beforeEach(async () => {
        //Given
        metadonneesFavoris = uneMetadonneeFavoris()
        offresPE = uneListeDOffres()
        recherchesPE = uneListeDeRecherches()
      })
      it('n’affiche pas les onglets agenda, actions et rdv', async () => {
        // When
        await renderFicheJeune(metadonneesFavoris, offresPE, recherchesPE)

        // Then
        expect(() => screen.getByText('Agenda')).toThrow()
        expect(() => screen.getByText('Actions')).toThrow()
        expect(() => screen.getByText('Rendez-vous')).toThrow()
      })

      it('affiche les onglets recherche et offres si le bénéficiaire a accepté le partage', async () => {
        // When
        await renderFicheJeune(metadonneesFavoris, offresPE, recherchesPE)

        // Then
        expect(screen.getByText('Offres')).toBeInTheDocument()
        expect(screen.getByText('Recherches')).toBeInTheDocument()
      })

      it('affiche le récapitulatif des favoris si le bénéficiaire a refusé le partage', async () => {
        // Given
        metadonneesFavoris.autoriseLePartage = false

        //When
        await renderFicheJeune(metadonneesFavoris, offresPE, recherchesPE)

        // Then
        expect(screen.getByText(/Emplois/)).toBeInTheDocument()
        expect(screen.getByText(/Alternances/)).toBeInTheDocument()
        expect(screen.getByText(/Services civiques/)).toBeInTheDocument()
        expect(screen.getByText(/Immersions/)).toBeInTheDocument()
        expect(screen.getByText(/Alertes/)).toBeInTheDocument()
      })
    })
  })

  describe('server side', () => {
    const rdvAVenir = unEvenementListItem({
      date: DateTime.now().plus({ day: 1 }).toISO(),
    })
    const sessionsAVenir = [
      {
        id: '1',
        type: 'Atelier i-milo',
        date: '2022-09-01T11:00:00.000Z',
        duree: 120,
        idCreateur: '1',
        isSession: true,
        estInscrit: true,
      },
    ]

    beforeEach(() => {
      ;(getJeuneDetails as jest.Mock).mockResolvedValue(unDetailJeune())
      ;(getConseillersDuJeuneServerSide as jest.Mock).mockResolvedValue(
        desConseillersJeune()
      )
      ;(getMetadonneesFavorisJeune as jest.Mock).mockResolvedValue(
        uneMetadonneeFavoris()
      )
      ;(getRendezVousJeune as jest.Mock).mockResolvedValue([rdvAVenir])
      ;(getSessionsMiloJeune as jest.Mock).mockResolvedValue([sessionsAVenir])
      ;(getActionsJeuneServerSide as jest.Mock).mockResolvedValue({
        actions: [
          uneAction({ creationDate: now.toISO() }),
          uneAction({ creationDate: datePasseeLoin.toISO() }),
          uneAction({ creationDate: dateFuture.toISO() }),
          uneAction({ creationDate: dateFutureLoin.toISO() }),
        ],
        metadonnees: { nombreTotal: 14, nombrePages: 2 },
      })
      ;(getOffres as jest.Mock).mockResolvedValue(uneListeDOffres())
      ;(getConseillerServerSide as jest.Mock).mockReturnValue(
        unConseiller({
          id: 'id-conseiller',
          structureMilo: { nom: 'Agence early', id: 'id-test' },
        })
      )
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
        process.env = Object.assign(process.env, {
          ENABLE_SESSIONS_MILO: 'true',
          IDS_STRUCTURES_EARLY_ADOPTERS: 'id-test',
        })
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
        expect(getJeuneDetails).toHaveBeenCalledWith('id-jeune', 'accessToken')
        expect(actual).toEqual({
          props: {
            jeune: unDetailJeune(),
            pageTitle: 'Portefeuille - Kenji Jirac',
            pageHeader: 'Kenji Jirac',
            rdvs: expect.arrayContaining([]),
            actionsInitiales: expect.arrayContaining([]),
            metadonneesFavoris: expect.arrayContaining([]),
            offresPE: expect.arrayContaining([]),
            recherchesPE: expect.arrayContaining([]),
          },
        })
      })

      it('récupère les rendez-vous à venir du jeune', async () => {
        // Then
        expect(getRendezVousJeune).toHaveBeenCalledWith(
          'id-jeune',
          'FUTURS',
          'accessToken'
        )
        expect(getSessionsMiloJeune).toHaveBeenCalledWith(
          'id-jeune',
          'accessToken',
          DateTime.fromISO('2023-09-08T00:00:00.000+02:00')
        )
        expect(actual).toMatchObject({
          props: { rdvs: [rdvAVenir, sessionsAVenir] },
        })
      })

      it('récupère les favoris', async () => {
        // Then
        expect(getMetadonneesFavorisJeune).toHaveBeenCalledWith(
          'id-jeune',
          'accessToken'
        )
        expect(actual).toMatchObject({
          props: { metadonneesFavoris: uneMetadonneeFavoris() },
        })
      })

      it('récupère la première page des actions du jeune', async () => {
        // Then
        expect(getActionsJeuneServerSide).toHaveBeenCalledWith(
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
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
          session: {
            accessToken: 'accessToken',
            user: { id: 'id-conseiller', structure: 'MILO' },
          },
          validSession: true,
        })

        // When
        const actual = await getServerSideProps({
          query: { jeune_id: 'id-jeune', page: 3 },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(getActionsJeuneServerSide).toHaveBeenCalledWith(
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

    describe('Quand le conseiller est Pôle emploi', () => {
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
        expect(getRendezVousJeune).not.toHaveBeenCalled()
        expect(getSessionsMiloJeune).not.toHaveBeenCalled()
        expect(actual).toMatchObject({ props: { rdvs: [] } })
      })

      it('ne recupère pas les actions', async () => {
        // Then
        expect(getActionsJeuneServerSide).not.toHaveBeenCalled()
        expect(actual).toMatchObject({
          props: { actionsInitiales: { actions: [] } },
        })
      })
    })

    describe('Quand le conseiller est observateur', () => {
      it('prépare la page en lecture seule', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
          session: {
            accessToken: 'accessToken',
            user: { id: 'id-observateur', structure: 'MILO' },
          },
          validSession: true,
        })

        // When
        const actual = await getServerSideProps({
          query: { jeune_id: 'id-jeune' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(getJeuneDetails).toHaveBeenCalledWith('id-jeune', 'accessToken')
        expect(actual).toMatchObject({
          props: {
            lectureSeule: true,
          },
        })
      })
    })
  })
})

async function renderFicheJeune(
  metadonnees: MetadonneesFavoris,
  offresPE: Offre[],
  recherchesPE: Recherche[]
) {
  await act(async () => {
    await renderWithContexts(
      <FicheJeune
        jeune={unDetailJeune()}
        rdvs={[]}
        actionsInitiales={desActionsInitiales()}
        pageTitle={''}
        metadonneesFavoris={metadonnees}
        offresPE={offresPE}
        recherchesPE={recherchesPE}
      />,
      {
        customConseiller: { structure: StructureConseiller.POLE_EMPLOI },
      }
    )
  })
}
