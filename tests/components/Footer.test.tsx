import { screen } from '@testing-library/dom'
import { render, RenderResult } from '@testing-library/react'
import React from 'react'

import Footer from 'components/layouts/Footer'

describe('<Footer/>', () => {
  let component: RenderResult
  it('affiche les liens du footer', () => {
    // GIVEN
    component = render(<Footer />)

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
