import { screen } from '@testing-library/dom'
import { render, within } from '@testing-library/react'
import RdvList from 'components/rdv/RdvList'
import { uneListeDeRdv, unRendezVous } from 'fixtures/rendez-vous'
import { Rdv } from 'interfaces/rdv'
import React from 'react'
import { formatDayDate, formatHourMinuteDate } from 'utils/date'

describe('<RdvList>', () => {
  let listeRdv: Rdv[]

  it("devrait afficher un message lorsqu'il n'y a pas de rendez-vous", () => {
    listeRdv = []
    render(<RdvList rdvs={listeRdv} idConseiller='1' />)
    expect(
      screen.getByText("Vous n'avez pas de rendez-vous pour le moment")
    ).toBeInTheDocument()
  })

  it("devrait afficher les informations d'un rendez-vous", () => {
    // Given
    listeRdv = uneListeDeRdv()

    // When
    render(<RdvList rdvs={listeRdv} idConseiller='1' />)

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

  it('affiche si l’utilisateur est le créateur du rendez-vous', () => {
    // Given
    listeRdv = uneListeDeRdv().concat(
      unRendezVous({
        id: '3',
        jeune: { id: '3', prenom: 'Nadia', nom: 'Sanfamiye' },
        idCreateur: null,
      })
    )

    // When
    render(<RdvList rdvs={listeRdv} idConseiller='1' />)
    const rendezVous0 = screen.getByRole('row', {
      name: new RegExp(`${listeRdv[0].jeune.prenom} ${listeRdv[0].jeune.nom}`),
    })
    const rendezVous1 = screen.getByRole('row', {
      name: new RegExp(`${listeRdv[1].jeune.prenom} ${listeRdv[1].jeune.nom}`),
    })
    const rendezVous2 = screen.getByRole('row', {
      name: new RegExp(`${listeRdv[2].jeune.prenom} ${listeRdv[2].jeune.nom}`),
    })

    // Then
    expect(within(rendezVous0).getByLabelText('oui')).toBeInTheDocument()
    expect(within(rendezVous1).getByLabelText('non')).toBeInTheDocument()
    expect(() => within(rendezVous2).getByLabelText('oui')).toThrow()
    expect(() => within(rendezVous2).getByLabelText('non')).toThrow()
  })

  it('ne devrait pas afficher un tableau de rdvs quand rdvs est vide', () => {
    expect(() => screen.getByRole('table')).toThrow()
  })
})
