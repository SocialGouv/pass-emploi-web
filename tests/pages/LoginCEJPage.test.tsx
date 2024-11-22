import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import React from 'react'

import LoginCEJPage from 'app/(connexion)/login/cej/LoginCEJPage'
import { LoginErrorMessageProvider } from 'utils/auth/loginErrorMessageContext'

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
      expect(signIn).toHaveBeenCalledWith(
        'keycloak',
        { callbackUrl: '/?redirectUrl=redirectUrl' },
        { kc_idp_hint: 'pe-conseiller' }
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
      expect(signIn).toHaveBeenCalledWith(
        'keycloak',
        { callbackUrl: '/?redirectUrl=redirectUrl' },
        { kc_idp_hint: 'similo-conseiller' }
      )
    })

    it('transmet l’erreur d’identification', async () => {
      // Given
      const miloButton = screen.getByRole('button', {
        name: 'Connexion Mission Locale',
      })
      ;(signIn as jest.Mock).mockRejectedValue(new Error())

      // When
      await userEvent.click(miloButton)

      // Then
      expect(setErrorMsg).toHaveBeenCalledWith(
        "une erreur est survenue lors de l'authentification"
      )
    })
  })
})
