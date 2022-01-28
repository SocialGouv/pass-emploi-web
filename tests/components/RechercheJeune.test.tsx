import { desJeunes } from 'fixtures/jeune'
import renderWithSession from '../renderWithSession'
import MesJeunes from 'pages/mes-jeunes'
import { UserStructure } from 'interfaces/conseiller'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

describe('Recherche', () => {
  beforeEach(async () => {
    //GIVEN
    const jeunes = desJeunes()

    renderWithSession(
      <MesJeunes
        structureConseiller={UserStructure.MILO}
        conseillerJeunes={jeunes}
      />
    )
  })

  it('devrait afficher un formulaire de recherche', () => {
    //GIVEN
    const searchForm = screen.getByRole('search') as HTMLFormElement
    const inputSearch = screen.getByLabelText('Rechercher un jeune par son nom')
    const submitButton = screen.getByRole('button', {
      name: 'Rechercher',
    })

    //THEN
    expect(searchForm).toBeInTheDocument()
    expect(inputSearch).toBeInTheDocument()
    expect(submitButton).toBeInTheDocument()
  })

  describe('devrait afficher le résultat de la recherche', () => {
    let searchForm: HTMLFormElement
    let inputSearch: HTMLInputElement
    let submitButton: HTMLButtonElement

    beforeEach(() => {
      searchForm = screen.getByRole('search') as HTMLFormElement
      inputSearch = screen.getByLabelText('Rechercher un jeune par son nom')
      submitButton = screen.getByRole('button', {
        name: 'Rechercher',
      })
    })

    it('quand on recherche un nom avec des caractères spéciaux', async () => {
      //GIVEN
      userEvent.type(inputSearch, 'muñoz')

      //WHEN
      fireEvent.click(submitButton)

      const result = screen.getByRole('row', {
        name: /muñoz/i,
      })

      //THEN
      expect(result).toBeInTheDocument()
    })
    it("quand on recherche un nom composé d'un espace et/ou avec tiret", async () => {
      const result = screen.getByRole('row', {
        name: /D'Aböville-Muñoz François/i,
      })

      userEvent.type(inputSearch, "D'Aböville-Muñoz")

      //WHEN
      fireEvent.click(submitButton)

      //THEN
      await waitFor(() => {
        expect(result).toBeInTheDocument()
      })
    })
  })
})
