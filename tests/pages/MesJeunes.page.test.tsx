import React from 'react'
import Router from 'next/router'
import { fireEvent, screen } from '@testing-library/react'
import { unJeune } from 'fixtures/jeune'
import MesJeunes from 'pages/mes-jeunes/index'
import renderWithSession from '../renderWithSession'
import { UserStructure } from 'interfaces/conseiller'

jest.mock('next/router')
describe('Mes Jeunes', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('devrait rediriger vers la page de création jeune quand le conseiller est MILO', () => {
    //GIVEN
    const jeune = unJeune()

    renderWithSession(
      <MesJeunes
        structureConseiller={UserStructure.MILO}
        conseillerJeunes={[jeune]}
      />
    )

    const addButton = screen.getByRole('button', {
      name: 'Ajouter un jeune',
    })

    const routerSpy = jest.spyOn(Router, 'push')

    //WHEN
    fireEvent.click(addButton)

    //THEN
    expect(routerSpy).toHaveBeenCalledWith('/mes-jeunes/milo/creation-jeune')
  })

  it('devrait rediriger vers la page de création jeune quand le conseiller est MILO', () => {
    //GIVEN
    const jeune = unJeune()

    renderWithSession(
      <MesJeunes
        structureConseiller={UserStructure.POLE_EMPLOI}
        conseillerJeunes={[jeune]}
      />
    )

    const addButton = screen.getByRole('button', {
      name: 'Ajouter un jeune',
    })

    const routerSpy = jest.spyOn(Router, 'push')

    //WHEN
    fireEvent.click(addButton)

    //THEN
    expect(routerSpy).toHaveBeenCalledWith(
      '/mes-jeunes/pole-emploi/creation-jeune'
    )
  })
})
