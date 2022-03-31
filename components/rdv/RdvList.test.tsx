import React from 'react'
import { render } from '@testing-library/react'
import RdvList from './RdvList'
import { Rdv } from '../../interfaces/rdv'
import { screen } from '@testing-library/dom'
import { uneListeDeRdv } from 'fixtures/rendez-vous'

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
    listeRdv = uneListeDeRdv()
    render(<RdvList rdvs={listeRdv} />)

    expect(screen.getByText('21/10/2021 (12:00 - 30 min)')).toBeInTheDocument()
    expect(
      screen.getByText(`${listeRdv[0].jeune.prenom} ${listeRdv[0].jeune.nom}`)
    ).toBeInTheDocument()
    expect(screen.getByText(listeRdv[0].type.label)).toBeInTheDocument()
    expect(screen.getByText(listeRdv[0].modality)).toBeInTheDocument()
  })

  it('ne devrait pas afficher un tableau de rdvs quand rdvs est vide', () => {
    expect(() => screen.getByRole('table')).toThrow()
  })
})
