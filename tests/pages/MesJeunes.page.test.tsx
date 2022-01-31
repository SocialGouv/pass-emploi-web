import React from 'react'
import Router from 'next/router'
import { fireEvent, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import '@testing-library/jest-dom'
import MesJeunes from 'pages/mes-jeunes/index'
import { unJeune } from 'fixtures/jeune'
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
  describe('Contenu de page', () => {
    const jeune1 = unJeune({ id: 'jeune-1' })
    const jeune2 = unJeune({ id: 'jeune-2' })
    const jeune3 = unJeune({ id: 'jeune-3' })

    const jeunes = [jeune1, jeune2, jeune3]
    beforeEach(async () => {
      //GIVEN
      renderWithSession(
        <MesJeunes
          structureConseiller={UserStructure.MILO}
          conseillerJeunes={jeunes}
        />
      )
    })

    it('devrait avoir un titre de niveau 1', () => {
      const heading = screen.getByRole('heading', {
        level: 1,
        name: 'Mes Jeunes',
      })

      expect(heading).toBeInTheDocument()
    })

    it('devrait afficher la liste des jeunes', () => {
      const rows = screen.getAllByRole('row')

      expect(rows.length - 1).toBe(jeunes.length)
    })
  })
})
