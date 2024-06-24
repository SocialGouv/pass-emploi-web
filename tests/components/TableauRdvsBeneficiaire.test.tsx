import { screen } from '@testing-library/dom'
import { render, within } from '@testing-library/react'
import { DateTime } from 'luxon'
import { usePathname } from 'next/navigation'
import React from 'react'

import TableauRdvsBeneficiaire from 'components/rdv/TableauRdvsBeneficiaire'
import { desEvenementsListItems } from 'fixtures/evenement'
import { uneBaseJeune } from 'fixtures/jeune'
import { EvenementListItem } from 'interfaces/evenement'
import { getNomBeneficiaireComplet } from 'interfaces/beneficiaire'
import { toShortDate } from 'utils/date'

describe('<TableauRdvsBeneficiaire>', () => {
  beforeEach(async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/mes-jeunes')
  })

  it("affiche un message lorsqu'il n'y a pas de rendez-vous", () => {
    // When
    render(
      <TableauRdvsBeneficiaire
        rdvs={[]}
        idConseiller='1'
        beneficiaire={uneBaseJeune()}
      />
    )

    // Then
    expect(
      screen.getByText(
        /Aucun événement ou rendez-vous sur cette période pour votre bénéficiaire./
      )
    ).toBeInTheDocument()

    expect(() => screen.getByRole('table')).toThrow()
  })

  describe('Quand il y a des rendez-vous', () => {
    let listeRdv: EvenementListItem[]
    beforeEach(() => {
      // Given
      listeRdv = desEvenementsListItems()

      // When
      render(
        <TableauRdvsBeneficiaire
          rdvs={listeRdv}
          idConseiller='1'
          beneficiaire={uneBaseJeune()}
        />
      )
    })

    it('affiche les informations des rendez-vous', () => {
      // Then
      listeRdv.forEach((rdv) => {
        const date = DateTime.fromISO(rdv.date)
        const horaires = `${toShortDate(date)} - ${date.toFormat(
          "HH'h'mm"
        )} - ${rdv.duree} min`
        expect(screen.getByText(rdv.type)).toBeInTheDocument()
        expect(screen.getByText(rdv.modality!)).toBeInTheDocument()
        expect(screen.getByText(horaires)).toBeInTheDocument()
      })
    })

    it('permet la modification des rendez-vous', () => {
      listeRdv.forEach((rdv) => {
        const link = screen.getByRole('link', {
          name: `Consulter l’événement du ${DateTime.fromISO(rdv.date).toFormat(
            'EEEE d MMMM',
            { locale: 'fr-FR' }
          )} avec ${getNomBeneficiaireComplet(uneBaseJeune())}`,
        })
        expect(link).toHaveAttribute(
          'href',
          '/mes-jeunes/edition-rdv?idRdv=' + rdv.id
        )
      })
    })

    it('affiche si l’utilisateur est le créateur du rendez-vous', () => {
      const rdvsRows = screen.getAllByRole('row', {
        name: new RegExp(`${listeRdv[0].labelBeneficiaires}`),
      })
      const rendezVous0 = rdvsRows[0]
      const rendezVous1 = rdvsRows[1]
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
