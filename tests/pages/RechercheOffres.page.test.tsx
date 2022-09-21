import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GetServerSidePropsContext } from 'next/types'

import { mockedOffresEmploiService } from 'fixtures/services'
import RechercheOffres, { getServerSideProps } from 'pages/recherche-offres'
import { OffresEmploiService } from 'services/offres-emploi.service'
import renderWithContexts from 'tests/renderWithContexts'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')

jest.mock('utils/auth/withMandatorySessionOrRedirect')

describe('Page Recherche Offres', () => {
  describe('client side', () => {
    let offresEmploiService: OffresEmploiService
    beforeEach(() => {
      offresEmploiService = mockedOffresEmploiService()
      renderWithContexts(<RechercheOffres />, {
        customDependances: { offresEmploiService },
      })
    })

    it('permet de saisir des mots clés', () => {
      // Then
      expect(screen.getByLabelText(/Mots clés/)).toHaveAttribute('type', 'text')
    })

    it("permet de rechercher des offres d'emploi", async () => {
      // Given
      const submitButton = screen.getByRole('button', { name: 'Rechercher' })

      // When
      await userEvent.click(submitButton)

      // Then
      expect(offresEmploiService.searchOffresEmploi).toHaveBeenCalledWith({})
    })

    it('construit la recherche', async () => {
      // Given
      const inputMotsCles = screen.getByLabelText(/Mots clés/)
      const submitButton = screen.getByRole('button', { name: 'Rechercher' })

      // When
      await userEvent.type(inputMotsCles, 'prof industrie')
      await userEvent.click(submitButton)

      // Then
      expect(offresEmploiService.searchOffresEmploi).toHaveBeenCalledWith({
        motsCles: 'prof industrie',
      })
    })
  })

  describe('server side', () => {
    it('requiert la connexion', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: false,
        redirect: { destination: 'whatever' },
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
      expect(actual).toEqual({ redirect: { destination: 'whatever' } })
    })

    it('charge la page avec les bonnes props', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(actual).toEqual({
        props: {
          pageTitle: 'Recherche d’offres',
          pageHeader: 'Offres',
        },
      })
    })
  })
})
