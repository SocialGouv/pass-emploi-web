import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import renderWithSession from '../renderWithSession'

import { desJeunesAvecActionsNonTerminees } from 'fixtures/jeune'
import { mockedMessagesService } from 'fixtures/services'
import { UserStructure } from 'interfaces/conseiller'
import MesJeunes from 'pages/mes-jeunes'
import { MessagesService } from 'services/messages.service'
import { DIProvider } from 'utils/injectionDependances'

describe('Recherche', () => {
  let messagesService: MessagesService

  beforeEach(async () => {
    //GIVEN
    const jeunes = desJeunesAvecActionsNonTerminees()

    messagesService = mockedMessagesService({
      signIn: jest.fn(() => Promise.resolve()),
      countMessagesNotRead: jest.fn(() => Promise.resolve({})),
    })

    await act(async () => {
      await renderWithSession(
        <DIProvider dependances={{ messagesService }}>
          <MesJeunes
            structureConseiller={UserStructure.MILO}
            conseillerJeunes={jeunes}
            isFromEmail
            pageTitle=''
          />
        </DIProvider>
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
      //GIVEN
      await userEvent.type(inputSearch, 'muñoz')

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

      await userEvent.type(inputSearch, "D'Aböville-Muñoz")

      //WHEN
      fireEvent.click(submitButton)

      //THEN
      await waitFor(() => {
        expect(result).toBeInTheDocument()
      })
    })
    it("quand on recherche un nom composé d'une apostrophe", async () => {
      const result = screen.getByRole('row', {
        name: /D'Aböville-Muñoz François/i,
      })

      await userEvent.type(inputSearch, 'D aböville-Muñoz')

      //WHEN
      fireEvent.click(submitButton)

      //THEN
      await waitFor(() => {
        expect(result).toBeInTheDocument()
      })
    })
  })
})
