import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import RechercheOffres, { getServerSideProps } from 'pages/recherche-offres'
import { searchOffresEmploi } from 'services/offres-emploi.service'
import renderWithContexts from 'tests/renderWithContexts'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/offres-emploi.service')

describe('Page Recherche Offres', () => {
  describe('client side', () => {
    beforeEach(() => {
      renderWithContexts(<RechercheOffres pageTitle='' />, {})
    })

    it('nécessite de selectionner un type d’offre', () => {
      // Then
      expect(
        screen.getByRole('heading', { level: 2, name: 'Ma recherche' })
      ).toBeInTheDocument()

      const etape1 = screen.getByRole('group', {
        name: 'Étape 1 Sélectionner un type d’offre',
      })
      expect(etape1).toBeInTheDocument()
      expect(
        within(etape1).getByRole('radio', { name: 'Offre d’emploi' })
      ).not.toHaveAttribute('disabled')
      expect(
        within(etape1).getByRole('radio', { name: 'Service civique' })
      ).not.toHaveAttribute('disabled')

      expect(() => screen.getByRole('group', { name: /Étape 2/ })).toThrow()
      expect(() => screen.getByRole('button', { name: 'Rechercher' })).toThrow()
    })

    it('n’affiche pas de résultat par défaut', () => {
      // Then
      expect(() => screen.getByText('Liste des résultats')).toThrow()
      expect(() => screen.getByRole('list')).toThrow()
    })

    it('affiche une erreur si la recherche échoue', async () => {
      // Given
      await userEvent.click(
        screen.getByRole('radio', { name: 'Offre d’emploi' })
      )
      ;(searchOffresEmploi as jest.Mock).mockRejectedValue('whatever')

      // When
      const submitButton = screen.getByRole('button', { name: 'Rechercher' })
      await userEvent.click(submitButton)

      // Then
      expect(screen.getByRole('alert')).toHaveTextContent(
        /Une erreur est survenue/
      )
    })

    it("affiche un message s'il n'y a pas de résultat", async () => {
      // Given
      await userEvent.click(
        screen.getByRole('radio', { name: 'Offre d’emploi' })
      )
      ;(searchOffresEmploi as jest.Mock).mockResolvedValue({
        metadonnees: { nombreTotal: 0, nombrePages: 0 },
        offres: [],
      })

      // When
      const submitButton = screen.getByRole('button', { name: 'Rechercher' })
      await userEvent.click(submitButton)

      // Then
      expect(
        screen.getByText(
          'Aucune offre ne correspond à vos critères de recherche.'
        )
      ).toBeInTheDocument()
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
      const actual = await getServerSideProps({
        query: {},
      } as GetServerSidePropsContext)

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
