import { screen, within } from '@testing-library/react'
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
    const offresEmploi = [{ titre: 'prof' }, { titre: 'assistant' }]
    beforeEach(() => {
      offresEmploiService = mockedOffresEmploiService({
        searchOffresEmploi: jest.fn().mockResolvedValue(offresEmploi),
      })

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

    it('affiche le resultat de la recherche', async () => {
      // Given
      const submitButton = screen.getByRole('button', { name: 'Rechercher' })

      // When
      await userEvent.click(submitButton)

      // Then
      const offresList = screen.getByRole('list')
      expect(within(offresList).getAllByRole('listitem').length).toEqual(
        offresEmploi.length
      )
      offresEmploi.forEach((offre) => {
        expect(within(offresList).getByText(offre.titre)).toBeInTheDocument()
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
