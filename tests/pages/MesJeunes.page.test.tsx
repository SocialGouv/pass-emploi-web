import { fireEvent, screen } from '@testing-library/react'
import { unJeune } from 'fixtures/jeune'
import MesJeunes from 'pages/mes-jeunes/index'
import React from 'react'
import renderWithSession from '../renderWithSession'
import Router from 'next/router'

jest.mock('next/router')

describe('Mes Jeunes', () => {
  it('devrait rediriger vers la page de création jeune', () => {
    //GIVEN
    const jeune = unJeune()

    renderWithSession(<MesJeunes conseillerJeunes={[jeune]} />)

    const addButton = screen.getByRole('button', {
      name: 'Ajouter un jeune',
    })

    const routerSpy = jest.spyOn(Router, 'push')

    //WHEN
    fireEvent.click(addButton)

    //THEN
    expect(routerSpy).toHaveBeenCalledWith('/mes-jeunes/milo/creation-jeune')
  })
})
