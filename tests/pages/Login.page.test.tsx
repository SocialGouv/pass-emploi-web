import { cleanup, render, screen } from '@testing-library/react'
import Login from 'pages/login'
import React from 'react'

describe('Login', () => {
  afterEach(() => cleanup)
  it('devrait afficher un titre de niveau 1', () => {
    render(<Login estPoleEmploiDesactive={false} />)

    //GIVEN
    const heading = screen.getByRole('heading', {
      level: 1,
      name: "Connectez-vous à l'espace conseiller",
    })

    //THEN
    expect(heading).toBeInTheDocument()
  })
  it("devrait trois boutons si Pole emploi n'est pas désactivé", () => {
    //GIVEN
    render(<Login estPoleEmploiDesactive={false} />)

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

  it('devrait deux boutons si Pole emploi est désactivé', () => {
    //GIVEN
    render(<Login estPoleEmploiDesactive={true} />)

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
})
