import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import React from 'react'

import LoginHubPage from 'app/(connexion)/login/LoginHubPage'
import { LoginErrorMessageProvider } from 'utils/auth/loginErrorMessageContext'

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}))

describe('LoginHubPage client side', () => {
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
          <LoginHubPage
            ssoFranceTravailBRSAEstActif={true}
            ssoFranceTravailAIJEstActif={true}
            ssoConseillerDeptEstActif={true}
            isFromEmail={false}
          />
        </LoginErrorMessageProvider>
      ))
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('devrait afficher un titre de niveau 1', () => {
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: "Connectez-vous à l'espace conseiller",
        })
      ).toBeInTheDocument()
    })

    it('devrait avoir 2 liens', () => {
      const lienCEJ = screen.getByRole('link', {
        name: 'Se connecter à l’application du contrat d’engagement jeune',
      })
      const lienPassEmploi = screen.getByRole('link', {
        name: 'Se connecter à l’application pass emploi',
      })

      //THEN
      expect(lienCEJ).toHaveAttribute('href', '/login/cej')
      expect(lienPassEmploi).toHaveAttribute('href', '/login/passemploi')
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
            <LoginHubPage
              ssoFranceTravailBRSAEstActif={true}
              isFromEmail={false}
            />
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
