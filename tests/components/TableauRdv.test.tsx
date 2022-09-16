import { screen } from '@testing-library/dom'
import { render, within } from '@testing-library/react'
import { DateTime } from 'luxon'
import React from 'react'

import TableauRdv from 'components/rdv/TableauRdv'
import { desRdvListItems, unRendezVous } from 'fixtures/rendez-vous'
import { RdvListItem, rdvToListItem } from 'interfaces/rdv'
import {
  WEEKDAY_MONTH_LONG,
  TIME_24_H_SEPARATOR,
  toFrenchFormat,
} from 'utils/date'

describe('<TableauRdv>', () => {
  it("affiche un message lorsqu'il n'y a pas de rendez-vous", () => {
    // When
    render(<TableauRdv rdvs={[]} idConseiller='1' />)

    // Then
    expect(screen.getByText(/pas de rendez-vous/)).toBeInTheDocument()

    expect(() => screen.getByRole('table')).toThrow()
  })

  describe('Quand il y a des rendez-vous', () => {
    let listeRdv: RdvListItem[]
    beforeEach(() => {
      // Given
      listeRdv = desRdvListItems().concat(
        rdvToListItem(
          unRendezVous({
            id: '3',
            type: {
              code: 'ENTRETIEN_INDIVIDUEL_CONSEILLER',
              label: 'Entretien individuel conseiller',
            },
            modality: 'en visio',
            date: '2022-10-21T10:00:00.000Z',
            duration: 30,
            jeunes: [{ id: '3', prenom: 'Nadia', nom: 'Sanfamiye' }],
            createur: null,
          })
        )
      )

      // When
      render(<TableauRdv rdvs={listeRdv} idConseiller='1' />)
    })

    it('affiche les informations des rendez-vous', () => {
      // Then
      listeRdv.forEach((rdv) => {
        const date = DateTime.fromISO(rdv.date)
        expect(screen.getByText(`${rdv.beneficiaires}`)).toBeInTheDocument()
        expect(screen.getByText(rdv.type)).toBeInTheDocument()
        expect(screen.getByText(rdv.modality)).toBeInTheDocument()
        expect(
          screen.getByText(
            `${toFrenchFormat(date, TIME_24_H_SEPARATOR)} - ${rdv.duration} min`
          )
        ).toBeInTheDocument()
      })
    })

    it('permet la modification des rendez-vous', () => {
      listeRdv.forEach((rdv) => {
        const link = screen.getByLabelText(
          `Modifier rendez-vous du ${toFrenchFormat(
            DateTime.fromISO(rdv.date),
            WEEKDAY_MONTH_LONG
          )} avec ${rdv.beneficiaires}`
        )
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute(
          'href',
          '/mes-jeunes/edition-rdv?idRdv=' + rdv.id
        )
      })
    })

    it('affiche si l’utilisateur est le créateur du rendez-vous', () => {
      const rendezVous0 = screen.getByRole('row', {
        name: new RegExp(`${listeRdv[0].beneficiaires}`),
      })
      const rendezVous1 = screen.getByRole('row', {
        name: new RegExp(`${listeRdv[1].beneficiaires}`),
      })
      const rendezVous2 = screen.getByRole('row', {
        name: new RegExp(`${listeRdv[2].beneficiaires}`),
      })

      // Then
      const labelCreateurRdv1 = within(rendezVous0).getByText('oui')
      expect(labelCreateurRdv1).toBeInTheDocument()
      expect(labelCreateurRdv1).toHaveAttribute('class', 'sr-only')
      const labelCreateurRdv2 = within(rendezVous1).getByText('non')
      expect(labelCreateurRdv2).toBeInTheDocument()
      expect(labelCreateurRdv2).toHaveAttribute('class', 'sr-only')
      expect(() => within(rendezVous2).getByText('oui')).toThrow()
      expect(() => within(rendezVous2).getByText('non')).toThrow()
    })
  })

  describe('Quand plusieurs jeunes participe à un rendez-vous', () => {
    it('should ', () => {
      // Given
      const listeRdv: RdvListItem[] = [
        rdvToListItem(
          unRendezVous({
            id: '3',
            type: {
              code: 'ENTRETIEN_INDIVIDUEL_CONSEILLER',
              label: 'Entretien individuel conseiller',
            },
            modality: 'en visio',
            date: '2022-10-21T10:00:00.000Z',
            duration: 30,
            jeunes: [
              { id: '3', prenom: 'Nadia', nom: 'Sanfamiye' },
              { id: '4', prenom: 'Avon', nom: 'Barksdale' },
              { id: '7', prenom: 'Christiano', nom: 'Seven' },
            ],
          })
        ),
      ]

      render(<TableauRdv rdvs={listeRdv} idConseiller='1' />)

      // When
      // Then
      expect(screen.getByText(`Bénéficiaires multiples`)).toBeInTheDocument()
    })
  })
})
