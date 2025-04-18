import { screen } from '@testing-library/dom'
import { act, render, within } from '@testing-library/react'
import { DateTime } from 'luxon'
import { usePathname } from 'next/navigation'
import React from 'react'

import TableauRdvsBeneficiaire from 'components/rdv/TableauRdvsBeneficiaire'
import { uneBaseBeneficiaire } from 'fixtures/beneficiaire'
import { desEvenementsListItems } from 'fixtures/evenement'
import { toFrenchDuration, toFrenchTime, toLongMonthDate } from 'utils/date'

describe('<TableauRdvsBeneficiaire>', () => {
  const listeRdv = desEvenementsListItems()

  beforeEach(async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/mes-jeunes')

    // When
    await act(async () => {
      render(
        <TableauRdvsBeneficiaire
          rdvs={listeRdv}
          idConseiller='id-conseiller-1'
          beneficiaire={uneBaseBeneficiaire()}
          shouldFocus={false}
        />
      )
    })
  })

  it('affiche les informations des rendez-vous', () => {
    // Then
    const rdv1 = listeRdv[0]
    const date1 = DateTime.fromISO(rdv1.date)
    const horaires1 = `${toLongMonthDate(date1)} ${toFrenchTime(date1, { a11y: true })} durée ${toFrenchDuration(rdv1.duree, { a11y: true })}`
    expect(
      screen.getByRole('cell', {
        name: `${rdv1.titre} ${rdv1.type} ${rdv1.modality}`,
      })
    ).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: horaires1 })).toBeInTheDocument()

    // Then
    const rdv2 = listeRdv[1]
    const date2 = DateTime.fromISO(rdv2.date)
    const horaires2 = `${toLongMonthDate(date2)} ${toFrenchTime(date2, { a11y: true })} durée ${toFrenchDuration(rdv2.duree, { a11y: true })}`
    expect(
      screen.getByRole('cell', {
        name: `${rdv2.titre} Non modifiable ${rdv2.type} ${rdv2.modality}`,
      })
    ).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: horaires2 })).toBeInTheDocument()
  })

  it('permet la modification des rendez-vous', () => {
    const link1 = screen.getByRole('link', {
      name: 'Consulter l’événement du 21 octobre 2021 12:00 - 2h05 Prise de nouvelles par téléphone Autre par téléphone Créé par Vous Inscrit',
    })
    expect(link1).toHaveAttribute(
      'href',
      '/mes-jeunes/edition-rdv?idRdv=' + listeRdv[0].id
    )
    const link2 = screen.getByRole('link', {
      name: 'Consulter l’événement du 25 octobre 2021 14:00 - 25 min Rendez-vous en agence Atelier En agence Créé par -- Inscrit',
    })
    expect(link2).toHaveAttribute(
      'href',
      '/mes-jeunes/edition-rdv?idRdv=' + listeRdv[1].id
    )
  })

  it('affiche si l’utilisateur est le créateur du rendez-vous', () => {
    const rdvsRows = screen.getAllByRole('row', {
      name: /Consulter l’événement du/,
    })
    const rendezVous0 = rdvsRows[0]
    const rendezVous1 = rdvsRows[1]
    // Then
    expect(
      within(rendezVous0).getByRole('cell', { name: 'Créé par Vous' })
    ).toBeInTheDocument()
    expect(
      within(rendezVous1).getByRole('cell', {
        name: 'Créé par -- information non disponible',
      })
    ).toBeInTheDocument()
  })
})
