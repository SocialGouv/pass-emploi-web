import { screen } from '@testing-library/dom'
import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import React from 'react'

import TableauRdvsConseiller from 'components/rdv/TableauRdvsConseiller'
import { desEvenementsListItems } from 'fixtures/evenement'
import { EvenementListItem } from 'interfaces/evenement'
import { buildAgendaData } from 'presentation/AgendaRows'
import {
  TIME_24_H_SEPARATOR,
  toFrenchFormat,
  WEEKDAY_MONTH_LONG,
} from 'utils/date'

describe('<TableauRdvsConseiller>', () => {
  const chargerEvenementsJour: (jour: DateTime) => Promise<void> = jest.fn()
  beforeEach(async () => {
    ;(useRouter as jest.Mock).mockReturnValue({ asPath: '/mes-jeunes' })
  })

  describe('Quand il y a des rendez-vous', () => {
    let listeRdv: EvenementListItem[]
    beforeEach(() => {
      // Given
      listeRdv = desEvenementsListItems()
      const agenda = buildAgendaData(
        listeRdv,
        {
          debut: DateTime.fromISO('2021-10-21'),
          fin: DateTime.fromISO('2021-10-26'),
        },
        ({ date }) => DateTime.fromISO(date),
        [0, 1, 4]
      )

      // When
      render(
        <TableauRdvsConseiller
          agendaRdvs={agenda}
          idConseiller='1'
          onChargerEvenementsJour={chargerEvenementsJour}
        />
      )
    })

    it('affiche les informations des rendez-vous', () => {
      // Then
      listeRdv.forEach((rdv) => {
        const horaires = `${toFrenchFormat(
          DateTime.fromISO(rdv.date),
          TIME_24_H_SEPARATOR
        )} - ${rdv.duree} min`

        expect(
          screen.getByText(`${rdv.labelBeneficiaires}`)
        ).toBeInTheDocument()
        expect(screen.getByText(rdv.type)).toBeInTheDocument()
        expect(screen.getByText(rdv.modality!)).toBeInTheDocument()
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

    it('permet de charger plus de rendez-vous', async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Afficher l’agenda du samedi 23 octobre',
        })
      )

      // Then
      expect(chargerEvenementsJour).toHaveBeenCalledWith(
        DateTime.fromISO('2021-10-23')
      )
    })
  })
})