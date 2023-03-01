import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'
import React from 'react'

import Login from 'pages/login'

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}))

describe('Login', () => {
  beforeEach(async () => {
    ;(useRouter as jest.Mock).mockReturnValue({
      query: { redirectUrl: 'redirectUrl' },
    })
  })

  describe('render', () => {
    beforeEach(async () => {
      render(<Login isFromEmail={false} />)
    })

    it('devrait afficher un titre de niveau 1', () => {
      //GIVEN
      const heading = screen.getByRole('heading', {
        level: 1,
        name: "Connectez-vous à l'espace conseiller",
      })

      //THEN
      expect(heading).toBeInTheDocument()
    })

    it('devrait avoir deux boutons', () => {
      const miloButton = screen.getByRole('button', {
        name: 'Connexion conseiller Mission Locale',
      })
      const poleEButton = screen.getByRole('button', {
        name: 'Connexion conseiller Pôle emploi',
      })
      const buttonsNb = screen.getAllByRole('button')

      //THEN
      expect(miloButton).toBeInTheDocument()
      expect(poleEButton).toBeInTheDocument()
      expect(buttonsNb.length).toEqual(2)
    })

    it("permet de s'identifier en tant que conseiller PE", async () => {
      // Given
      const peButton = screen.getByRole('button', {
        name: 'Connexion conseiller Pôle emploi',
      })

      // When
      await userEvent.click(peButton)

      // Then
      expect(signIn).toHaveBeenCalledWith(
        'keycloak',
        { callbackUrl: '/index?redirectUrl=redirectUrl' },
        { kc_idp_hint: 'pe-conseiller' }
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
        { callbackUrl: '/index?redirectUrl=redirectUrl' },
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
    beforeEach(() => {
      originalInnerWidth = Object.getOwnPropertyDescriptor(
        window,
        'innerWidth'
      )!
    })

    afterEach(() => {
      Object.defineProperty(window, 'innerWidth', originalInnerWidth)
    })

    it("affiche une modale d'onboarding", async () => {
      // Given
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 599,
      })

      // When
      render(<Login isFromEmail={false} />)

      // Then
      expect(screen.getByRole('heading', { level: 2 })).toHaveAccessibleName(
        'Bienvenue sur l’espace mobile du conseiller'
      )
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

  describe('quand la connexion pass emploi est activée', () => {
    beforeEach(async () => {
      render(<Login ssoPassEmploiEstActif={true} isFromEmail={false} />)
    })

    it('devrait avoir trois boutons', () => {
      //GIVEN
      const passEButton = screen.getByRole('button', {
        name: 'Authentification pass emploi',
      })

      const miloButton = screen.getByRole('button', {
        name: 'Connexion conseiller Mission Locale',
      })

      const poleEButton = screen.getByRole('button', {
        name: 'Connexion conseiller Pôle emploi',
      })

      const buttonsNb = screen.getAllByRole('button')

      //THEN
      expect(passEButton).toBeInTheDocument()
      expect(miloButton).toBeInTheDocument()
      expect(poleEButton).toBeInTheDocument()
      expect(buttonsNb.length).toEqual(3)
    })

    it("permet de s'identifier en tant que conseiller Pass emploi", async () => {
      // Given
      const peButton = screen.getByRole('button', {
        name: 'Authentification pass emploi',
      })

      // When
      await userEvent.click(peButton)

      // Then
      expect(signIn).toHaveBeenCalledWith(
        'keycloak',
        { callbackUrl: '/index?redirectUrl=redirectUrl' },
        { kc_idp_hint: '' }
      )
    })
  })
})
