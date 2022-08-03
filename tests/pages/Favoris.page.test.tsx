import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GetServerSidePropsResult } from 'next'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { uneListeDeRecherches, uneListeDOffres } from 'fixtures/favoris'
import { mockedFavorisService } from 'fixtures/services'
import Favoris, {
  getServerSideProps,
} from 'pages/mes-jeunes/[jeune_id]/favoris'
import { FavorisService } from 'services/favoris.service'
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
      render(<Favoris offres={offres} recherches={recherches} pageTitle={''} />)
    })

    it('affiche la liste de ses offres', () => {
      // Then
      expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
        'Favoris 2'
      )
      offres.forEach((offre) => {
        expect(screen.getByText(offre.titre)).toBeInTheDocument()
      })
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
    let favorisService: FavorisService

    describe('Quand la session est invalide', () => {
      it('redirige', async () => {
        // Given
        favorisService = mockedFavorisService()
        ;(withDependance as jest.Mock).mockReturnValue(favorisService)
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
        favorisService = mockedFavorisService({
          getOffres: jest.fn(async () => offres),
          getRecherches: jest.fn(async () => recherches),
        })
        ;(withDependance as jest.Mock).mockReturnValue(favorisService)
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
        expect(favorisService.getRecherches).toHaveBeenCalledWith(
          'id-jeune',
          'accessToken'
        )
        expect(actual).toEqual({
          props: {
            offres: offres,
            recherches: recherches,
            pageTitle: 'Favoris',
          },
        })
      })
    })

    describe('Quand la session est valide mais que la ressource n’est pas accessible au conseiller', () => {
      let actual: GetServerSidePropsResult<any>
      it('rediriges vers la page d’accueil', async () => {
        // Given
        favorisService = mockedFavorisService({
          getOffres: jest.fn(() => {
            throw new ApiError(403, 'erreur')
          }),
          getRecherches: jest.fn(() => {
            throw new ApiError(403, 'erreur')
          }),
        })
        ;(withDependance as jest.Mock).mockReturnValue(favorisService)
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
