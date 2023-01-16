import { screen } from '@testing-library/dom'
import { render, within } from '@testing-library/react'
import { DateTime } from 'luxon'
import React from 'react'

import TableauRdv from 'components/rdv/TableauRdv'
import { desEvenementsListItems } from 'fixtures/evenement'
import { EvenementListItem } from 'interfaces/evenement'
import {
  TIME_24_H_SEPARATOR,
  toFrenchFormat,
  toShortDate,
  WEEKDAY_MONTH_LONG,
} from 'utils/date'

describe('<TableauRdv>', () => {
  it("affiche un message lorsqu'il n'y a pas de rendez-vous", () => {
    // When
    render(<TableauRdv rdvs={[]} idConseiller='1' />)

    // Then
    expect(screen.getByText(/pas d’événement/)).toBeInTheDocument()

    expect(() => screen.getByRole('table')).toThrow()
  })

  describe('Quand il y a des rendez-vous', () => {
    let listeRdv: EvenementListItem[]
    beforeEach(() => {
      // Given
      listeRdv = desEvenementsListItems()

      // When
      render(<TableauRdv rdvs={listeRdv} idConseiller='1' />)
    })

    it('affiche les informations des rendez-vous', () => {
      // Then
      listeRdv.forEach((rdv) => {
        const date = DateTime.fromISO(rdv.date)
        const horaires = `${toShortDate(date)} - ${toFrenchFormat(
          date,
          TIME_24_H_SEPARATOR
        )} - ${rdv.duree} min`
        expect(
          screen.getByText(`${rdv.labelBeneficiaires}`)
        ).toBeInTheDocument()
        expect(screen.getByText(rdv.type)).toBeInTheDocument()
        expect(screen.getByText(rdv.modality)).toBeInTheDocument()
        expect(screen.getByText(horaires)).toBeInTheDocument()
      })
    })

    it('permet la modification des rendez-vous', () => {
      listeRdv.forEach((rdv) => {
        const link = screen.getByLabelText(
          `Consulter l’événement du ${toFrenchFormat(
            DateTime.fromISO(rdv.date),
            WEEKDAY_MONTH_LONG
          )} avec ${rdv.labelBeneficiaires}`
        )
        expect(link).toHaveAttribute(
          'href',
          '/mes-jeunes/edition-rdv?idRdv=' + rdv.id
        )
      })
    })

    it('affiche si l’utilisateur est le créateur du rendez-vous', () => {
      const rendezVous0 = screen.getByRole('row', {
        name: new RegExp(`${listeRdv[0].labelBeneficiaires}`),
      })
      const rendezVous1 = screen.getByRole('row', {
        name: new RegExp(`${listeRdv[1].labelBeneficiaires}`),
      })

      // Then
      expect(within(rendezVous0).getByText('oui')).toHaveAttribute(
        'class',
        'sr-only'
      )
      expect(within(rendezVous1).getByText('non')).toHaveAttribute(
        'class',
        'sr-only'
      )
    })
  })
})
