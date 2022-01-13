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

  describe('quand le conseiller est MILO', () => {
    beforeEach(async () => {
      //GIVEN
      const jeune = unJeune()

      renderWithSession(
        <MesJeunes
          structureConseiller={UserStructure.MILO}
          conseillerJeunes={[jeune]}
        />
      )
    })

    it('redirige vers la page de création jeune MILO', () => {
      // GIVEN
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

  describe('quand le conseiller est Pole emploi', () => {
    beforeEach(async () => {
      //GIVEN
      const jeune = unJeune()

      renderWithSession(
        <MesJeunes
          structureConseiller={UserStructure.POLE_EMPLOI}
          conseillerJeunes={[jeune]}
        />
      )
    })

    it('devrait rediriger vers la page de création jeune PE', () => {
      // GIVEN
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
})
