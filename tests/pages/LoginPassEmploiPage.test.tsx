import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import React from 'react'

import LoginPassEmploiPage from 'app/(connexion)/login/passemploi/LoginPassEmploiPage'
import { LoginErrorMessageProvider } from 'utils/auth/loginErrorMessageContext'

describe('LoginPassEmploiPage client side', () => {
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
          <LoginPassEmploiPage
            ssoFranceTravailBRSAEstActif={true}
            ssoFranceTravailAIJEstActif={true}
            ssoConseillerDeptEstActif={true}
          />
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

    it('devrait afficher deux titres de niveau 2', () => {
      //GIVEN
      const headingCEJ = screen.getByRole('heading', {
        level: 2,
        name: 'Connexion conseiller RSA',
      })
      const headingBRSA = screen.getByRole('heading', {
        level: 2,
        name: 'Connexion conseiller AIJ',
      })

      //THEN
      expect(headingCEJ).toBeInTheDocument()
      expect(headingBRSA).toBeInTheDocument()
    })

    it('devrait avoir trois boutons', () => {
      const franceTravailAIJButton = screen.getByRole('button', {
        name: 'Connexion France Travail AIJ',
      })
      const franceTravailRSAButton = screen.getByRole('button', {
        name: 'Connexion France Travail RSA',
      })
      const conseillerDeptButton = screen.getByRole('button', {
        name: 'Connexion Conseil départemental',
      })

      //THEN
      expect(franceTravailAIJButton).toBeInTheDocument()
      expect(franceTravailRSAButton).toBeInTheDocument()
      expect(conseillerDeptButton).toBeInTheDocument()
    })

    it("permet de s'identifier en tant que conseiller FT BRSA", async () => {
      // Given
      const peBRSAButton = screen.getByRole('button', {
        name: 'Connexion France Travail RSA',
      })

      // When
      await userEvent.click(peBRSAButton)

      // Then
      expect(signIn).toHaveBeenCalledWith(
        'keycloak',
        { callbackUrl: '/?redirectUrl=redirectUrl' },
        { kc_idp_hint: 'pe-brsa-conseiller' }
      )
    })

    it("permet de s'identifier en tant que conseiller FT AIJ", async () => {
      // Given
      const peAIJButton = screen.getByRole('button', {
        name: 'Connexion France Travail AIJ',
      })

      // When
      await userEvent.click(peAIJButton)

      // Then
      expect(signIn).toHaveBeenCalledWith(
        'keycloak',
        { callbackUrl: '/?redirectUrl=redirectUrl' },
        { kc_idp_hint: 'pe-aij-conseiller' }
      )
    })

    it("permet de s'identifier en tant que conseiller dept", async () => {
      // Given
      const cdButton = screen.getByRole('button', {
        name: 'Connexion Conseil départemental',
      })

      // When
      await userEvent.click(cdButton)

      // Then
      expect(signIn).toHaveBeenCalledWith(
        'keycloak',
        { callbackUrl: '/?redirectUrl=redirectUrl' },
        { kc_idp_hint: 'conseildepartemental-conseiller' }
      )
    })

    it('transmet l’erreur d’identification', async () => {
      // Given
      const cdButton = screen.getByRole('button', {
        name: 'Connexion Conseil départemental',
      })
      ;(signIn as jest.Mock).mockRejectedValue(new Error())

      // When
      await userEvent.click(cdButton)

      // Then
      expect(setErrorMsg).toHaveBeenCalledWith(
        "une erreur est survenue lors de l'authentification"
      )
    })
  })
})
