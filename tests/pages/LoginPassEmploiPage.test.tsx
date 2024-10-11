import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import React from 'react'

import LoginPassEmploiPage from 'app/(connexion)/login/passemploi/LoginPassEmploiPage'
import { LoginErrorMessageProvider } from 'utils/auth/loginErrorMessageContext'

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}))

describe('LoginPassEmploiPage client side', () => {
  let container: HTMLElement
  beforeEach(async () => {
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: (param: string) => param,
    })
  })

  describe('render', () => {
    beforeEach(async () => {
      ;({ container } = render(
        <LoginErrorMessageProvider state={[undefined, jest.fn()]}>
          <LoginPassEmploiPage
            ssoFranceTravailBRSAEstActif={true}
            ssoFranceTravailAIJEstActif={true}
            ssoConseillerDeptEstActif={true}
          />
        </LoginErrorMessageProvider>
      ))
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
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
      const franceTravailBRSAButton = screen.getByRole('button', {
        name: 'Connexion BRSA',
      })
      const franceTravailAIJButton = screen.getByRole('button', {
        name: 'Connexion AIJ',
      })
      const conseillerDeptButton = screen.getByRole('button', {
        name: 'Connexion conseil départemental',
      })

      const buttonsNb = screen.getAllByRole('button')

      //THEN
      expect(franceTravailBRSAButton).toBeInTheDocument()
      expect(franceTravailAIJButton).toBeInTheDocument()
      expect(conseillerDeptButton).toBeInTheDocument()
      expect(buttonsNb.length).toEqual(3)
    })

    it("permet de s'identifier en tant que conseiller FT BRSA", async () => {
      // Given
      const peBRSAButton = screen.getByRole('button', {
        name: 'Connexion BRSA',
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
        name: 'Connexion AIJ',
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
        name: 'Connexion conseil départemental',
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

    it("n'affiche pas de modale d'onboarding mobile", () => {
      // Then
      expect(() =>
        screen.getByText('Bienvenue sur l’espace mobile du conseiller')
      ).toThrow()
    })
  })

  describe("quand l'utilisateur est sur mobile", () => {
    let originalInnerWidth: PropertyDescriptor
    beforeEach(async () => {
      originalInnerWidth = Object.getOwnPropertyDescriptor(
        window,
        'innerWidth'
      )!

      // Given
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 599,
      })

      // When
      await act(async () => {
        ;({ container } = render(
          <LoginErrorMessageProvider state={[undefined, jest.fn()]}>
            <LoginPassEmploiPage ssoFranceTravailBRSAEstActif={true} />
          </LoginErrorMessageProvider>
        ))
      })
    })

    afterEach(() => {
      Object.defineProperty(window, 'innerWidth', originalInnerWidth)
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it("affiche une modale d'onboarding", async () => {
      // Then
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Bienvenue sur l’espace mobile du conseiller',
        })
      ).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3 })).toHaveAccessibleName(
        'Un accès dedié à vos conversations'
      )
      expect(
        screen.getByText(
          'Retrouvez l’ensemble de vos conversations avec les bénéficiaires de votre portefeuile.'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'À ce jour, seul l’accès à la messagerie est disponible sur l’espace mobile.'
        )
      ).toBeInTheDocument()
    })
  })
})
