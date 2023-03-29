import { act, screen } from '@testing-library/react'
import { DateTime } from 'luxon'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { desIndicateursSemaine, unDetailJeune } from 'fixtures/jeune'
import { mockedJeunesService } from 'fixtures/services'
import Indicateurs, {
  getServerSideProps,
} from 'pages/mes-jeunes/[jeune_id]/indicateurs'
import { getByTextContent } from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('Indicateurs', () => {
  describe('client side', () => {
    const SEPTEMBRE_1 = DateTime.fromISO('2022-09-01T14:00:00.000+02:00')

    beforeEach(async () => {
      // Given
      jest.spyOn(DateTime, 'now').mockReturnValue(SEPTEMBRE_1)
      const jeunesService = mockedJeunesService({
        getIndicateursJeuneComplets: jest.fn(async () =>
          desIndicateursSemaine()
        ),
      })
      ;(withDependance as jest.Mock).mockReturnValue(jeunesService)

      // Given
      await act(async () => {
        await renderWithContexts(
          <Indicateurs idJeune='id-jeune' lectureSeule={false} pageTitle='' />,
          {
            customDependances: { jeunesService },
          }
        )
      })
    })

    it('affiche la semaine courante', async () => {
      expect(
        screen.getByText('Semaine du 29/08/2022 au 04/09/2022')
      ).toBeInTheDocument()
    })

    it('affiche les indicateurs des actions', async () => {
      const indicateursActions = screen.getByRole('heading', {
        name: 'Les actions',
      }).parentElement
      expect(
        getByTextContent('0Créées', indicateursActions!)
      ).toBeInTheDocument()
      expect(
        getByTextContent('1Terminée', indicateursActions!)
      ).toBeInTheDocument()
      expect(
        getByTextContent('2En retard', indicateursActions!)
      ).toBeInTheDocument()
    })

    it('affiche l’indicateur de rendez-vous', async () => {
      const indicateursRdv = screen.getByRole('heading', {
        name: 'Les événements',
      }).parentElement
      expect(
        getByTextContent('3Cette semaine', indicateursRdv!)
      ).toBeInTheDocument()
    })

    it('affiche les indicateurs des offres', async () => {
      const indicateursOffres = screen.getByRole('heading', {
        name: 'Les offres',
      }).parentElement
      expect(
        getByTextContent('10Offres consultées', indicateursOffres!)
      ).toBeInTheDocument()
      expect(
        getByTextContent('4Offres partagées', indicateursOffres!)
      ).toBeInTheDocument()
      expect(
        getByTextContent('6Favoris ajoutés', indicateursOffres!)
      ).toBeInTheDocument()
      expect(
        getByTextContent('7Recherches sauvegardées', indicateursOffres!)
      ).toBeInTheDocument()
    })
  })

  describe('server side', () => {
    describe('Pour un conseiller Pole Emploi', () => {
      it('renvoie une 404', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          session: {
            user: { structure: 'POLE_EMPLOI' },
          },
          validSession: true,
        })

        // When
        const actual = await getServerSideProps({} as GetServerSidePropsContext)

        // Then
        expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
        expect(actual).toEqual({ notFound: true })
      })
    })

    describe('quand le conseiller est connecté', () => {
      it('récupère le titre de la page, et les id du jeune et du conseiller', async () => {
        // Given
        const jeunesService = mockedJeunesService({
          getJeuneDetails: jest.fn(async () => unDetailJeune()),
        })
        ;(withDependance as jest.Mock).mockReturnValue(jeunesService)
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { structure: 'MILO', id: 'id-conseiller' },
          },
        })

        // When
        const actual = await getServerSideProps({
          query: { jeune_id: 'id-jeune' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({
          props: {
            idJeune: 'id-jeune',
            lectureSeule: false,
            pageTitle: 'Portefeuille - Bénéficiaire - Indicateurs',
            pageHeader: 'Indicateurs',
          },
        })
      })
    })
  })
})
