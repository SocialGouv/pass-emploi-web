import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { useSearchParams } from 'next/navigation'
import React from 'react'

import LoginFranceTravailPage from 'app/(connexion)/login/france-travail/LoginFranceTravailPage'
import { signin } from 'utils/auth/auth'
import { LoginErrorMessageProvider } from 'utils/auth/loginErrorMessageContext'

jest.mock('utils/auth/auth', () => ({
  signin: jest.fn(),
}))

describe('LoginFranceTravailPage client side', () => {
  let container: HTMLElement
  beforeEach(async () => {
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: (param: string) => param,
    })
  })

  describe('render', () => {
    const setErrorMsg = jest.fn()
    beforeEach(async () => {
      ;({ container } = render(
        <LoginErrorMessageProvider state={[undefined, setErrorMsg]}>
          <LoginFranceTravailPage />
        </LoginErrorMessageProvider>
      ))
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it('affiche un titre', () => {
      //GIVEN
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Connexion conseiller France Travail',
        })
      ).toBeInTheDocument()
    })

    it('affiche un bouton pour les utilisateurs ayant un compte', async () => {
      // Then
      expect(
        screen.getByRole('button', {
          name: 'Connexion France Travail',
        })
      ).toHaveAccessibleDescription('Vous avez déjà un compte ?')
    })

    it('affiche un lien pour une première visite', () => {
      // Then
      expect(
        screen.getByRole('link', { name: 'Première visite ?' })
      ).toHaveAttribute('href', '/login/france-travail/dispositifs')
    })

    it("permet de s'identifier de manière unique en tant que conseiller FT", async () => {
      // Given
      const boutonConnexionUnique = screen.getByRole('button', {
        name: 'Connexion France Travail',
      })

      // When
      await userEvent.click(boutonConnexionUnique)

      // Then
      expect(signin).toHaveBeenCalledWith(
        'ft-conseiller',
        setErrorMsg,
        'redirectUrl'
      )
    })
  })
})
