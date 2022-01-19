import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import Login from 'pages/login'
import React from 'react'
import { AuthService } from 'services/auth.service'
import { DIProvider } from 'utils/injectionDependances'

jest.mock('next/router', () => ({
  useRouter() {
    return {
      query: { redirectUrl: 'redirectUrl' },
    }
  },
}))
describe('Login', () => {
  const authService: AuthService = {
    fetchRefreshedTokens: jest.fn(),
    getFirebaseToken: jest.fn(),
    signIn: jest.fn(),
  }

  afterEach(() => {
    jest.resetAllMocks()
    return cleanup
  })

  describe('render', () => {
    beforeEach(async () => {
      render(
        <DIProvider dependances={{ authService }}>
          <Login />
        </DIProvider>
      )
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
      expect(authService.signIn).toHaveBeenCalledWith('redirectUrl', undefined)
    })

    it("permet de s'identifier en tant que conseiller MiLo", async () => {
      // Given
      const miloButton = screen.getByRole('button', {
        name: 'Connexion conseiller Mission Locale',
      })

      // When
      fireEvent.submit(miloButton)

      // Then
      expect(authService.signIn).toHaveBeenCalledWith(
        'redirectUrl',
        'similo-conseiller'
      )
    })
  })

  it('devrait avoir trois boutons si la connexion pass emploi est activé', () => {
    //GIVEN
    render(
      <DIProvider dependances={{ authService }}>
        <Login ssoPassEmploiEstActive={true} />
      </DIProvider>
    )

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
})
