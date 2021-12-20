import React from 'react'
import Router from 'next/router'
import { fireEvent, screen } from '@testing-library/react'
import { unJeune } from 'fixtures/jeune'
import MesJeunes from 'pages/mes-jeunes/index'
import renderWithSession from '../renderWithSession'
import { UserStructure } from 'interfaces/conseiller'
var ReactDOM = require('react-dom')

jest.mock('next/router')
describe('Mes Jeunes', () => {
  beforeEach(() => {
    ReactDOM.createPortal = jest.fn((element, node) => {
      return element
    })
  })
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

  /**
   * Test en skip, car la modale de création du jeune sera peut être appelée plus tard
   */
  it.skip("devrait ouvrir une Modale quand le conseiller n'est pas MILO", () => {
    //GIVEN

    renderWithSession(
      <MesJeunes
        structureConseiller={UserStructure.POLE_EMPLOI}
        conseillerJeunes={[]}
      />
    )

    const addButton = screen.getByRole('button', {
      name: 'Ajouter un jeune',
    })

    const reactDomSpy = jest.spyOn(ReactDOM, 'createPortal')

    //WHEN
    fireEvent.click(addButton)

    //THEN
    expect(reactDomSpy).toHaveBeenCalledTimes(1)
  })
})
