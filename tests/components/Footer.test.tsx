import { screen } from '@testing-library/dom'
import { render, RenderResult } from '@testing-library/react'
import React from 'react'

import Footer from 'components/layouts/Footer'
import { unConseiller } from 'fixtures/conseiller'
import { StructureConseiller } from 'interfaces/conseiller'
import renderWithContexts from 'tests/renderWithContexts'

describe('<Footer/>', () => {
  it('affiche les liens par défaut du footer ', () => {
    // GIVEN & WHEN
    render(<Footer aDesBeneficiaires={true} conseiller={unConseiller()} />)

    // THEN
    expect(
      screen.getByRole('link', {
        name: "Niveau d'accessibilité: partiellement conforme (nouvelle fenêtre)",
      })
    ).toHaveAttribute(
      'href',
      'https://doc.pass-emploi.beta.gouv.fr/legal/web_accessibilite/'
    )
    expect(
      screen.getByRole('link', {
        name: "Conditions Générales d'Utilisation (nouvelle fenêtre)",
      })
    ).toHaveAttribute(
      'href',
      'https://doc.pass-emploi.beta.gouv.fr/legal/web_conditions_generales'
    )
    expect(
      screen.getByRole('link', {
        name: 'Mentions légales (nouvelle fenêtre)',
      })
    ).toHaveAttribute(
      'href',
      'https://doc.pass-emploi.beta.gouv.fr/legal/web_mentions_legales'
    )
    expect(
      screen.getByRole('link', {
        name: 'Politique de confidentialité (nouvelle fenêtre)',
      })
    ).toHaveAttribute(
      'href',
      'https://travail-emploi.gouv.fr/application-contrat-dengagement-jeune-cej-traitement-des-donnees-personnelles'
    )
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('affiche les liens du footer pour PE BRSA', () => {
    // GIVEN
    const conseiller = unConseiller({
      structure: StructureConseiller.POLE_EMPLOI_BRSA,
    })

    // WHEN
    renderWithContexts(
      <Footer aDesBeneficiaires={true} conseiller={conseiller} />,
      {
        customConseiller: conseiller,
      }
    )

    //THEN
    expect(
      screen.getByRole('link', {
        name: "Niveau d'accessibilité: partiellement conforme (nouvelle fenêtre)",
      })
    ).toHaveAttribute(
      'href',
      'https://doc.pass-emploi.beta.gouv.fr/legal/web_pass_emploi_accessibilite/'
    )
    expect(
      screen.getByRole('link', {
        name: "Conditions Générales d'Utilisation (nouvelle fenêtre)",
      })
    ).toHaveAttribute(
      'href',
      'https://doc.pass-emploi.beta.gouv.fr/legal/web_pass_emploi_conditions_generales'
    )
    expect(
      screen.getByRole('link', {
        name: 'Mentions légales (nouvelle fenêtre)',
      })
    ).toHaveAttribute(
      'href',
      'https://doc.pass-emploi.beta.gouv.fr/legal/pass_emploi_mentions_legales/'
    )
    expect(
      screen.getByRole('link', {
        name: 'Politique de confidentialité (nouvelle fenêtre)',
      })
    ).toHaveAttribute(
      'href',
      'https://doc.pass-emploi.beta.gouv.fr/legal/web_pass_emploi_politique_de_confidentialite'
    )
  })
})
