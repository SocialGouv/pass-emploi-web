import { screen } from '@testing-library/dom'
import { render } from '@testing-library/react'
import RdvList from 'components/rdv/RdvList'
import { uneListeDeRdv } from 'fixtures/rendez-vous'
import { Rdv } from 'interfaces/rdv'
import React from 'react'
import { formatDayDate, formatHourMinuteDate } from 'utils/date'

describe('<RdvList>', () => {
  let listeRdv: Rdv[]

  it("devrait afficher un message lorsqu'il n'y a pas de rendez-vous", () => {
    listeRdv = []
    render(<RdvList rdvs={listeRdv} />)
    expect(
      screen.getByText("Vous n'avez pas de rendez-vous pour le moment")
    ).toBeInTheDocument()
  })

  it("devrait afficher les informations d'un rendez-vous", () => {
    // Given
    listeRdv = uneListeDeRdv()

    // When
    render(<RdvList rdvs={listeRdv} />)

    // Then
    listeRdv.forEach((rdv) => {
      const date = new Date(rdv.date)
      expect(
        screen.getByText(`${rdv.jeune.prenom} ${rdv.jeune.nom}`)
      ).toBeInTheDocument()
      expect(screen.getByText(rdv.type.label)).toBeInTheDocument()
      expect(screen.getByText(rdv.modality)).toBeInTheDocument()
      expect(
        screen.getByText(
          `${formatDayDate(date)} (${formatHourMinuteDate(date)} - ${
            rdv.duration
          } min)`
        )
      ).toBeInTheDocument()
      const link = screen.getByLabelText(
        `Modifier rendez-vous du ${rdv.date} avec ${rdv.jeune.prenom} ${rdv.jeune.nom}`
      )
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        '/mes-jeunes/edition-rdv?idRdv=' + rdv.id
      )
    })
  })

  it('ne devrait pas afficher un tableau de rdvs quand rdvs est vide', () => {
    expect(() => screen.getByRole('table')).toThrow()
  })
})
