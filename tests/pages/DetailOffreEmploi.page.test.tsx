import { act, screen, within } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import React from 'react'

import OffrePage from 'app/(connected)/(with-sidebar)/(with-chat)/offres/[typeOffre]/[idOffre]/OffrePage'
import { unDetailOffreEmploi } from 'fixtures/offre'
import { DetailOffreEmploi } from 'interfaces/offre'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'
expect.extend(toHaveNoViolations)

jest.mock('components/PageActionsPortal')

describe('OffrePage client side - Emploi', () => {
  let container: HTMLElement
  let offre: DetailOffreEmploi

  beforeEach(async () => {
    // Given
    offre = unDetailOffreEmploi()

    // When
    await act(async () => {
      ;({ container } = renderWithContexts(<OffrePage offre={offre} />))
    })
  })

  it('a11y', async () => {
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it("permet de partager l'offre", () => {
    // Then
    expect(
      screen.getByRole('link', { name: `Partager offre ${offre.titre}` })
    ).toHaveAttribute('href', `/offres/emploi/${offre.id}/partage`)
  })

  it("affiche la date d'actualisation de l'offre", () => {
    // Then
    expect(
      screen.getByText('Actualisée le vendredi 30 septembre')
    ).toBeInTheDocument()
  })

  it('affiche le titre de l’offre', () => {
    // Then
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: offre.titre,
      })
    ).toBeInTheDocument()
  })

  it("affiche les informations principales de l'offre", () => {
    const section = screen.getByRole('region', {
      name: "Informations de l'offre",
    })
    expect(
      within(section).getByRole('heading', { level: 3 })
    ).toHaveAccessibleName("Informations de l'offre")

    expect(getByDescriptionTerm('Entreprise', section)).toHaveTextContent(
      offre.nomEntreprise!
    )
    expect(getByDescriptionTerm('Localisation', section)).toHaveTextContent(
      offre.localisation!
    )
    expect(getByDescriptionTerm('Type de contrat', section)).toHaveTextContent(
      offre.typeContratLibelle
    )
    expect(getByDescriptionTerm('Salaire', section)).toHaveTextContent(
      offre.salaire!
    )
    expect(getByDescriptionTerm('Horaires', section)).toHaveTextContent(
      offre.horaires!
    )
  })

  it("affiche le détail de l'offre", () => {
    const section = screen.getByRole('region', { name: 'Détail de l’offre' })
    expect(section).toBeInTheDocument()
    expect(
      within(section).getByRole('heading', { level: 3 })
    ).toHaveAccessibleName('Détail de l’offre')

    expect(getByDescriptionTerm('Description', section)).toHaveTextContent(
      offre.description!
    )
    expect(
      within(getByDescriptionTerm('Lien offre', section)).getByRole('link', {
        name: "Voir l'offre détaillée (nouvelle fenêtre)",
      })
    ).toHaveAttribute('href', offre.urlPostulation)
  })

  it('affiche le profil souhaité', () => {
    const section = screen.getByRole('region', { name: 'Profil souhaité' })
    expect(section).toBeInTheDocument()
    expect(
      within(section).getByRole('heading', { level: 3 })
    ).toHaveAccessibleName('Profil souhaité')

    expect(getByDescriptionTerm('Expériences', section)).toHaveTextContent(
      offre.experience!.libelle!
    )
    expect(getByDescriptionTerm('Expériences', section)).toContainElement(
      screen.getByLabelText('Expérience exigée')
    )
    expect(
      getByDescriptionTerm('Savoir et savoir faire', section)
    ).toHaveTextContent(offre.competences.join(''))
    expect(
      getByDescriptionTerm('Savoir être professionnel', section)
    ).toHaveTextContent(offre.competencesProfessionnelles.join(''))
    expect(getByDescriptionTerm('Formation', section)).toHaveTextContent(
      offre.formations.join('')
    )
    expect(getByDescriptionTerm('Langue', section)).toHaveTextContent(
      offre.langues.join('')
    )
    expect(getByDescriptionTerm('Permis', section)).toHaveTextContent(
      offre.permis.join('')
    )
  })

  it("affiche les informations de l'entreprise", () => {
    const section = screen.getByRole('region', {
      name: "Informations de l' Entreprise",
    })
    expect(section).toBeInTheDocument()
    expect(
      within(section).getByRole('heading', { level: 3 })
    ).toHaveAccessibleName("Informations de l' Entreprise")

    expect(
      within(getByDescriptionTerm('Lien site', section)).getByRole('link', {
        name: "Site de l'entreprise (nouvelle fenêtre)",
      })
    ).toHaveAttribute('href', offre.infoEntreprise!.lien)
    expect(() => getByDescriptionTerm('Entreprise adaptée', section)).toThrow()
    expect(
      getByDescriptionTerm('Entreprise handi-bienveillante', section)
    ).toHaveTextContent('OUI')
    expect(
      getByDescriptionTerm("Détail de l'entreprise", section)
    ).toHaveTextContent(offre.infoEntreprise!.detail!)
  })
})
