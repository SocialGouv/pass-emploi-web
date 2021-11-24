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

    expect(screen.getByText('21/10/2021 (10:00 - 30 min)')).toBeInTheDocument()
    expect(screen.getByText('Par téléphone')).toBeInTheDocument()
    expect(screen.getByText('Rendez-vous avec Rama')).toBeInTheDocument()
  })

  it('ne devrait pas afficher un tableau de rdvs quand rdvs est vide', () => {
    expect(() => screen.getByRole('table')).toThrow()
  })
  it('devrait afficher les rdvs à venir du plus proche au plus lointain', () => {
    listeRdv = uneListeDeRdvJeune()
    const rdvsTriesParLePlusProche = listeRdv.sort(
      (rdv1, rdv2) => new Date(rdv1.date) - new Date(rdv2.date)
    )
    expect(rdvsTriesParLePlusProche[0].date).toBe(
      'Thu, 21 Oct 2021 07:00:00 GMT'
    )
    expect(rdvsTriesParLePlusProche[1].date).toBe(
      'Thu, 21 Oct 2021 12:00:00 GMT'
    )
    expect(rdvsTriesParLePlusProche[2].date).toBe(
      'Mon, 25 Oct 2021 07:00:00 GMT'
    )
  })
})
