import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import React from 'react'

import Login from 'pages/login'

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}))

describe('Login', () => {
  describe('render', () => {
    beforeEach(async () => {
      ;(useRouter as jest.Mock).mockReturnValue({
        query: { redirectUrl: 'redirectUrl' },
      })

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
