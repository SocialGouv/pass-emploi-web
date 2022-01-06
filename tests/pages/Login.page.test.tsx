import { cleanup, render, screen } from '@testing-library/react'
import Login from 'pages/login'
import React from 'react'

describe('Login', () => {
  afterEach(() => cleanup)
  it('devrait afficher un titre de niveau 1', () => {
    render(<Login ssoPoleEmploiEstActive={true} />)

    //GIVEN
    const heading = screen.getByRole('heading', {
      level: 1,
      name: "Connectez-vous à l'espace conseiller",
    })

    //THEN
    expect(heading).toBeInTheDocument()
  })
  it('devrait avoir trois boutons si Pole emploi est active', () => {
    //GIVEN
    render(<Login ssoPoleEmploiEstActive={true} />)

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

  it("devrait avoir deux boutons si Pole emploi n'est pas active", () => {
    //GIVEN
    render(<Login ssoPoleEmploiEstActive={false} />)

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
