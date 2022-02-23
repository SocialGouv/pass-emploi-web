import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { signIn } from 'next-auth/react'
import Login from 'pages/login'
import React from 'react'
import renderWithSession from '../renderWithSession'

jest.mock('next/router', () => ({
  useRouter() {
    return {
      query: { redirectUrl: 'redirectUrl' },
    }
  },
}))
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}))
describe('Login', () => {
  afterEach(() => {
    jest.resetAllMocks()
    return cleanup
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
      fireEvent.submit(peButton)

      // Then
      expect(signIn).toHaveBeenCalledWith(
        'keycloak',
        { callbackUrl: 'redirectUrl' },
        { kc_idp_hint: 'pe-conseiller' }
      )
    })

    it("permet de s'identifier en tant que conseiller MiLo", async () => {
      // Given
      const miloButton = screen.getByRole('button', {
        name: 'Connexion conseiller Mission Locale',
      })

      // When
      fireEvent.submit(miloButton)

      // Then
      expect(signIn).toHaveBeenCalledWith(
        'keycloak',
        { callbackUrl: 'redirectUrl' },
        { kc_idp_hint: 'similo-conseiller' }
      )
    })
  })

  describe('quand la connexion pass emploi est activée', () => {
    beforeEach(async () => {
      console.log(' ---------------------- before ----------------------')
      renderWithSession(
        <Login ssoPassEmploiEstActive={true} isFromEmail={false} />
      )
    })

    it.only('devrait avoir trois boutons', () => {
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
      fireEvent.submit(peButton)

      // Then
      expect(signIn).toHaveBeenCalledWith(
        'keycloak',
        { callbackUrl: 'redirectUrl' },
        { kc_idp_hint: '' }
      )
    })
  })
})
