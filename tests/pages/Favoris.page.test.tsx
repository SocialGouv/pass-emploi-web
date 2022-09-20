import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GetServerSidePropsResult } from 'next'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { uneListeDeRecherches, uneListeDOffres } from 'fixtures/favoris'
import {
  mockedFavorisService,
  mockedOffresEmploiService,
} from 'fixtures/services'
import Favoris, {
  getServerSideProps,
} from 'pages/mes-jeunes/[jeune_id]/favoris'
import { OffresEmploiService } from 'services/offres-emploi.service'
import { ServicesCiviqueService } from 'services/services-civique.service'
import renderWithContexts from 'tests/renderWithContexts'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { ApiError } from 'utils/httpClient'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('Favoris', () => {
  const offres = uneListeDOffres()
  const recherches = uneListeDeRecherches()

  describe('client side', () => {
    let offresEmploiService: OffresEmploiService
    let servicesCiviqueService: ServicesCiviqueService
    let mockOpen: () => null

    beforeEach(async () => {
      offresEmploiService = mockedOffresEmploiService()
      servicesCiviqueService = { getLienServiceCivique: jest.fn() }
      mockOpen = jest.fn()
      jest.spyOn(window, 'open').mockImplementation(mockOpen)

      renderWithContexts(
        <Favoris offres={offres} recherches={recherches} pageTitle={''} />,
        { customDependances: { offresEmploiService, servicesCiviqueService } }
      )
    })

    it('affiche la liste des offres du jeune', () => {
      // Then
      expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
        'Offres 3'
      )
      offres.forEach((offre) => {
        expect(screen.getByText(offre.titre)).toBeInTheDocument()
      })
    })

    it('permet d’accéder à l’offre d’emploi', async () => {
      // Given
      ;(offresEmploiService.getLienOffreEmploi as jest.Mock).mockResolvedValue(
        'https://wwww.pole-emploi.fr/une-id'
      )
      const offre = screen.getByText('Offre d’emploi')
      // When
      await userEvent.click(offre)
      // Then
      expect(offresEmploiService.getLienOffreEmploi).toHaveBeenCalledWith(
        'idOffre1'
      )
      expect(mockOpen).toHaveBeenCalledWith(
        'https://wwww.pole-emploi.fr/une-id',
        '_blank',
        'noopener,noreferrer'
      )
    })

    it('permet d’accéder à l’offre de service civique', async () => {
      // Given
      ;(
        servicesCiviqueService.getLienServiceCivique as jest.Mock
      ).mockResolvedValue('https://wwww.service-civique.fr/une-id')
      const serviceCivique = screen.getByText('Service civique')
      // When
      await userEvent.click(serviceCivique)
      // Then
      expect(servicesCiviqueService.getLienServiceCivique).toHaveBeenCalledWith(
        'idOffre2'
      )
      expect(mockOpen).toHaveBeenCalledWith(
        'https://wwww.service-civique.fr/une-id',
        '_blank',
        'noopener,noreferrer'
      )
    })

    it('renvoit une 404 lorsque le lien n’a pas été trouvé', async () => {
      // Given
      ;(
        servicesCiviqueService.getLienServiceCivique as jest.Mock
      ).mockResolvedValue(undefined)
      const serviceCivique = screen.getByText('Service civique')
      // When
      await userEvent.click(serviceCivique)
      // Then
      expect(servicesCiviqueService.getLienServiceCivique).toHaveBeenCalledWith(
        'idOffre2'
      )
      expect(mockOpen).toHaveBeenCalledWith('/404', '_blank')
    })

    it('ne permet pas d’acceder aux offres d’Immersion', async () => {
      // Given
      const immersion = screen.getByText('Immersion')
      // When
      await userEvent.click(immersion)
      // Then
      expect(mockOpen).toHaveBeenCalledTimes(0)
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
        expect(favorisService.getRecherchesSauvegardees).toHaveBeenCalledWith(
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
