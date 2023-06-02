import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { desJeunesAvecActionsNonTerminees } from 'fixtures/jeune'
import MesJeunes from 'pages/mes-jeunes'
import { countMessagesNotRead, signIn } from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/messages.service')

describe('Recherche', () => {
  beforeEach(async () => {
    //GIVEN
    const jeunes = desJeunesAvecActionsNonTerminees()

    ;(signIn as jest.Mock).mockResolvedValue(undefined)
    ;(countMessagesNotRead as jest.Mock).mockResolvedValue({})

    await act(() => {
      renderWithContexts(
        <MesJeunes conseillerJeunes={jeunes} isFromEmail pageTitle='' />
      )
    })
  })

  it('devrait afficher un formulaire de recherche', () => {
    //GIVEN
    const searchForm = screen.getByRole('search') as HTMLFormElement
    const inputSearch = screen.getByLabelText(
      'Rechercher un bénéficiaire par son nom ou prénom'
    )
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
      inputSearch = screen.getByLabelText(
        'Rechercher un bénéficiaire par son nom ou prénom'
      )
      submitButton = screen.getByRole('button', {
        name: 'Rechercher',
      })
    })

    it('quand on recherche un nom avec des caractères spéciaux', async () => {
      //WHEN
      await userEvent.type(inputSearch, 'muñoz')
      await userEvent.click(submitButton)

      //THEN
      const result = screen.getByRole('row', {
        name: /muñoz/i,
      })
      expect(result).toBeInTheDocument()
    })

    it("quand on recherche un nom composé d'un espace et/ou avec tiret", async () => {
      //WHEN
      await userEvent.type(inputSearch, "D'Aböville-Muñoz")
      await userEvent.click(submitButton)

      //THEN
      const result = screen.getByRole('row', {
        name: /D'Aböville-Muñoz François/i,
      })
      expect(result).toBeInTheDocument()
    })

    it("quand on recherche un nom composé d'une apostrophe", async () => {
      //WHEN
      await userEvent.type(inputSearch, 'D aböville-Muñoz')
      await userEvent.click(submitButton)

      //THEN
      const result = screen.getByRole('row', {
        name: /D'Aböville-Muñoz François/i,
      })
      expect(result).toBeInTheDocument()
    })

    it('quand on recherche un prénom', async () => {
      //WHEN
      await userEvent.type(inputSearch, 'Nadia')
      await userEvent.click(submitButton)

      //THEN
      const result = screen.getByRole('row', {
        name: /Nadia/i,
      })
      expect(result).toBeInTheDocument()
    })
  })
})
