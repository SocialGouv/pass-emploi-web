import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { desJeunesAvecActionsNonTerminees } from 'fixtures/jeune'
import {
  mockedConseillerService,
  mockedMessagesService,
} from 'fixtures/services'
import MesJeunes from 'pages/mes-jeunes'
import { ConseillerService } from 'services/conseiller.service'
import { MessagesService } from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'

describe('Recherche', () => {
  let messagesService: MessagesService
  let conseillerService: ConseillerService

  beforeEach(async () => {
    //GIVEN
    const jeunes = desJeunesAvecActionsNonTerminees()

    messagesService = mockedMessagesService({
      signIn: jest.fn(() => Promise.resolve()),
      countMessagesNotRead: jest.fn(() => Promise.resolve({})),
    })
    conseillerService = mockedConseillerService()

    await act(() => {
      renderWithContexts(
        <MesJeunes conseillerJeunes={jeunes} isFromEmail pageTitle='' />,
        {
          customDependances: { messagesService, conseillerService },
        }
      )
    })
  })

  it('devrait afficher un formulaire de recherche', () => {
    //GIVEN
    const searchForm = screen.getByRole('search') as HTMLFormElement
    const inputSearch = screen.getByLabelText(
      'Rechercher un jeune par son nom de famille'
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
        'Rechercher un jeune par son nom de famille'
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
  })
})
