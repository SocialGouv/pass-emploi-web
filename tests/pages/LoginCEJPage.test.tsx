import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { useSearchParams } from 'next/navigation'
import React from 'react'

import LoginCEJPage from 'app/(connexion)/login/cej/LoginCEJPage'
import { signin } from 'utils/auth/auth'
import { LoginErrorMessageProvider } from 'utils/auth/loginErrorMessageContext'

jest.mock('utils/auth/auth', () => ({
  signin: jest.fn(),
}))

describe('LoginCEJPage client side', () => {
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
          <LoginCEJPage />
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

    it('devrait avoir deux boutons', () => {
      const miloButton = screen.getByRole('button', {
        name: 'Connexion Mission Locale',
      })
      const franceTravailCEJButton = screen.getByRole('button', {
        name: 'Connexion France Travail',
      })

      const buttonsNb = screen.getAllByRole('button')

      //THEN
      expect(miloButton).toBeInTheDocument()
      expect(franceTravailCEJButton).toBeInTheDocument()
      expect(buttonsNb.length).toEqual(2)
    })

    it("permet de s'identifier en tant que conseiller FT CEJ", async () => {
      // Given
      const peButton = screen.getByRole('button', {
        name: 'Connexion France Travail',
      })

      // When
      await userEvent.click(peButton)

      // Then
      expect(signin).toHaveBeenCalledWith(
        'pe-conseiller',
        setErrorMsg,
        'redirectUrl'
      )
    })

    it("permet de s'identifier en tant que conseiller MiLo", async () => {
      // Given
      const miloButton = screen.getByRole('button', {
        name: 'Connexion Mission Locale',
      })

      // When
      await userEvent.click(miloButton)

      // Then
      expect(signin).toHaveBeenCalledWith(
        'similo-conseiller',
        setErrorMsg,
        'redirectUrl'
      )
    })
  })
})
