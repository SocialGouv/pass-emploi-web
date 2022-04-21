import React from 'react'
import { RenderResult } from '@testing-library/react'
import { screen } from '@testing-library/dom'
import renderWithSession from '../renderWithSession'
import { Footer } from 'components/Footer'

describe('<Footer/>', () => {
  let component: RenderResult
  it('affiche les liens du footer', () => {
    // GIVEN
    component = renderWithSession(<Footer />)

    // WHEN

    // THEN
    expect(
      screen.getByRole('link', {
        name: "Niveau d'accessibilité: non conforme (nouvelle fenêtre)",
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: "Conditions Générales d'Utilisation (nouvelle fenêtre)",
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: 'Mentions légales (nouvelle fenêtre)',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: 'Politique de confidentialité (nouvelle fenêtre)',
      })
    ).toBeInTheDocument()
  })
})
