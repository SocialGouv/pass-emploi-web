import React from 'react'
import { render } from '@testing-library/react'
import { RdvJeune } from '../../interfaces/rdv'
import { screen } from '@testing-library/dom'
import { uneListeDeRdvJeune } from 'fixtures/rendez-vous'
import ListeRdvJeune from 'components/jeune/ListeRdvJeune'

describe('<ListeRdvJeune', () => {
  let listeRdv: RdvJeune[]

  it("devrait afficher un message lorsqu'il n'y a pas de rendez-vous", () => {
    listeRdv = []
    render(<ListeRdvJeune rdvs={listeRdv} />)
    expect(screen.getByText('Pas de rendez-vous planifiés')).toBeInTheDocument()
  })

  it("devrait afficher les informations d'un rendez-vous jeune", () => {
    listeRdv = uneListeDeRdvJeune()
    render(<ListeRdvJeune rdvs={listeRdv} />)

    expect(screen.getByText('21/10/2021 (07:00 - 30 min)')).toBeInTheDocument()
    expect(screen.getAllByText('En agence')[0]).toBeInTheDocument()
    expect(screen.getByText('Rendez-vous avec Rama')).toBeInTheDocument()
  })

  it('ne devrait pas afficher un tableau de rdvs quand rdvs est vide', () => {
    expect(() => screen.getByRole('table')).toThrow()
  })
})
