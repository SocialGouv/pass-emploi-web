import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GetServerSidePropsResult } from 'next'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { uneListeDeRecherches, uneListeDOffres } from 'fixtures/favoris'
import {
  desConseillersJeune,
  desIndicateursSemaine,
  unDetailJeune,
} from 'fixtures/jeune'
import { mockedFavorisService, mockedJeunesService } from 'fixtures/services'
import Favoris, {
  getServerSideProps,
} from 'pages/mes-jeunes/[jeune_id]/favoris'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { ApiError } from 'utils/httpClient'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('Favoris', () => {
  const offres = uneListeDOffres()
  const recherches = uneListeDeRecherches()

  describe('client side', () => {
    beforeEach(async () => {
      render(
        <Favoris
          offres={offres}
          recherches={recherches}
          pageTitle={''}
          lectureSeule={false}
        />
      )
    })

    it('affiche la liste des offres du jeune', () => {
      // Then
      expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
        'Offres 4'
      )
      offres.forEach((offre) => {
        expect(screen.getByText(offre.titre)).toBeInTheDocument()
      })
    })

    it('permet d’accéder à l’offre d’emploi', async () => {
      // Then
      const offre = screen.getByRole('row', {
        name: 'Ouvrir l’offre offre 1',
      })

      expect(offre).toHaveAttribute('href', '/offres/emploi/idOffre1')
    })

    it('permet d’accéder à l’offre de service civique', async () => {
      // Then
      const offre = screen.getByRole('row', {
        name: 'Ouvrir l’offre offre 2',
      })

      expect(offre).toHaveAttribute('href', '/offres/service-civique/idOffre2')
    })

    it('permet d’accéder à l’offre d’immersion', async () => {
      // Then
      const offre = screen.getByRole('row', {
        name: 'Ouvrir l’offre offre 3',
      })

      expect(offre).toHaveAttribute('href', '/offres/immersion/idOffre3')
    })

    it('permet d’accéder à l’offre d’alternance', async () => {
      // Then
      const offre = screen.getByRole('row', {
        name: 'Ouvrir l’offre offre 4',
      })

      expect(offre).toHaveAttribute('href', '/offres/emploi/idOffre4')
    })

    it('affiche la liste de ses recherches', async () => {
      // When
      const tabActions = screen.getByRole('tab', { name: 'Recherches 2' })
      await userEvent.click(tabActions)

      // Then
      expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
        'Recherches 2'
      )
      recherches.forEach((recherche) => {
        expect(screen.getByText(recherche.titre)).toBeInTheDocument()
      })
    })
  })

  describe('server side', () => {
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
      it('récupère les offres et les recherches du jeune', async () => {
        // Given
        const favorisService = mockedFavorisService({
          getOffres: jest.fn(async () => offres),
          getRecherchesSauvegardees: jest.fn(async () => recherches),
        })
        const jeunesService = mockedJeunesService({
          getJeuneDetails: jest.fn(async () => unDetailJeune()),
        })
        ;(withDependance as jest.Mock).mockImplementation((dependance) => {
          if (dependance === 'jeunesService') return jeunesService
          if (dependance === 'favorisService') return favorisService
        })
        ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
          session: {
            accessToken: 'accessToken',
            user: { id: 'id-conseiller', structure: 'MILO' },
          },
          validSession: true,
        })

        // When
        const actual = await getServerSideProps({
          query: { jeune_id: 'id-jeune' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(favorisService.getOffres).toHaveBeenCalledWith(
          'id-jeune',
          'accessToken'
        )
        expect(favorisService.getRecherchesSauvegardees).toHaveBeenCalledWith(
          'id-jeune',
          'accessToken'
        )
        expect(actual).toEqual({
          props: {
            lectureSeule: false,
            offres: offres,
            recherches: recherches,
            pageTitle: 'Favoris',
          },
        })
      })
    })

    describe('Quand la session est valide mais que la ressource n’est pas accessible au conseiller', () => {
      let actual: GetServerSidePropsResult<any>
      it('redirige vers la page d’accueil', async () => {
        // Given
        const favorisService = mockedFavorisService({
          getOffres: jest.fn(() => {
            throw new ApiError(403, 'erreur')
          }),
          getRecherchesSauvegardees: jest.fn(() => {
            throw new ApiError(403, 'erreur')
          }),
        })

        const jeunesService = mockedJeunesService({
          getJeuneDetails: jest.fn(async () => unDetailJeune()),
        })
        ;(withDependance as jest.Mock).mockImplementation((dependance) => {
          if (dependance === 'jeunesService') return jeunesService
          if (dependance === 'favorisService') return favorisService
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

        // Then
        expect(actual).toEqual({
          redirect: {
            destination: '/mes-jeunes',
            permanent: false,
          },
        })
      })
    })
  })
})
