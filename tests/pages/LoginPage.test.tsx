import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import React from 'react'

import LoginPage from 'app/(connexion)/login/LoginPage'
expect.extend(toHaveNoViolations)

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}))

describe('LoginPage client side', () => {
  let container: HTMLElement
  beforeEach(async () => {
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: (param: string) => param,
    })
  })

  describe('render', () => {
    beforeEach(async () => {
      ;({ container } = render(
        <LoginPage
          ssoFranceTravailBRSAEstActif={true}
          ssoFranceTravailAIJEstActif={true}
          isFromEmail={false}
        />
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
        name: 'Contrat d’engagement jeune',
      })
      const headingBRSA = screen.getByRole('heading', {
        level: 2,
        name: 'pass emploi',
      })

      //THEN
      expect(headingCEJ).toBeInTheDocument()
      expect(headingBRSA).toBeInTheDocument()
    })

    it('devrait avoir quatre boutons', () => {
      const miloButton = screen.getByRole('button', {
        name: 'Connexion conseiller Mission Locale',
      })
      const franceTravailCEJButton = screen.getByRole('button', {
        name: 'Connexion conseiller France Travail CEJ',
      })
      const franceTravailBRSAButton = screen.getByRole('button', {
        name: 'Connexion conseiller France Travail BRSA',
      })
      const franceTravailAIJButton = screen.getByRole('button', {
        name: 'Connexion conseiller France Travail AIJ',
      })

      const buttonsNb = screen.getAllByRole('button')

      //THEN
      expect(miloButton).toBeInTheDocument()
      expect(franceTravailCEJButton).toBeInTheDocument()
      expect(franceTravailBRSAButton).toBeInTheDocument()
      expect(franceTravailAIJButton).toBeInTheDocument()
      expect(buttonsNb.length).toEqual(4)
    })

    it("permet de s'identifier en tant que conseiller FT CEJ", async () => {
      // Given
      const peButton = screen.getByRole('button', {
        name: 'Connexion conseiller France Travail CEJ',
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

    it("permet de s'identifier en tant que conseiller FT BRSA", async () => {
      // Given
      const peBRSAButton = screen.getByRole('button', {
        name: 'Connexion conseiller France Travail BRSA',
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
        name: 'Connexion conseiller France Travail AIJ',
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

    it("permet de s'identifier en tant que conseiller MiLo", async () => {
      // Given
      const miloButton = screen.getByRole('button', {
        name: 'Connexion conseiller Mission Locale',
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
          <LoginPage ssoFranceTravailBRSAEstActif={true} isFromEmail={false} />
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
