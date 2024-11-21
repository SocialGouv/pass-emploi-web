import { screen } from '@testing-library/dom'
import { DateTime } from 'luxon'
import { usePathname } from 'next/navigation'
import React from 'react'

import TableauEvenementsConseiller from 'components/rdv/TableauEvenementsConseiller'
import { desEvenementsListItems } from 'fixtures/evenement'
import { EvenementListItem } from 'interfaces/evenement'
import renderWithContexts from 'tests/renderWithContexts'
import { toFrenchDuration, toFrenchTime, toLongMonthDate } from 'utils/date'

describe('<TableauRdvsConseiller>', () => {
  beforeEach(async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/mes-jeunes')
  })

  describe('Quand il y a des rendez-vous', () => {
    let listeRdv: EvenementListItem[]
    beforeEach(() => {
      // Given
      listeRdv = desEvenementsListItems()

      // When
      renderWithContexts(
        <TableauEvenementsConseiller
          evenements={listeRdv}
          periodeLabel='du dd/mm/yyyy au dd/mm/yyyy'
        />
      )
    })

    it('affiche les informations des rendez-vous', () => {
      // Then
      listeRdv.forEach((rdv) => {
        const horaires = `${toLongMonthDate(DateTime.fromISO(rdv.date))} ${toFrenchTime(rdv.date)} - durée ${toFrenchDuration(
          rdv.duree,
          { a11y: true }
        )}`

        expect(
          screen.getByText(`${rdv.labelBeneficiaires}`)
        ).toBeInTheDocument()
        expect(screen.getByText(rdv.type)).toBeInTheDocument()
        expect(screen.getByText(rdv.modality!)).toBeInTheDocument()
        expect(screen.getByRole('cell', { name: horaires })).toBeInTheDocument()
      })
    })

    it('permet la modification des rendez-vous', () => {
      listeRdv.forEach((rdv) => {
        const link = screen.getByRole('link', {
          name: `Consulter l’événement du ${toLongMonthDate(DateTime.fromISO(rdv.date))} à ${toFrenchTime(rdv.date, { a11y: true })} avec ${rdv.labelBeneficiaires}`,
        })
        expect(link).toHaveAttribute(
          'href',
          '/mes-jeunes/edition-rdv?idRdv=' + rdv.id
        )
      })
    })
  })
})
