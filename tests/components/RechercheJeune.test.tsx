import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import renderWithSession from '../renderWithSession'

import { unConseiller } from 'fixtures/conseiller'
import { desJeunesAvecActionsNonTerminees } from 'fixtures/jeune'
import {
  mockedConseillerService,
  mockedMessagesService,
} from 'fixtures/services'
import { StructureConseiller } from 'interfaces/conseiller'
import MesJeunes from 'pages/mes-jeunes'
import { ConseillerService } from 'services/conseiller.service'
import { MessagesService } from 'services/messages.service'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'
import { DIProvider } from 'utils/injectionDependances'

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

    await act(async () => {
      await renderWithSession(
        <DIProvider dependances={{ messagesService, conseillerService }}>
          <ConseillerProvider conseiller={unConseiller()}>
            <MesJeunes
              structureConseiller={StructureConseiller.MILO}
              conseillerJeunes={jeunes}
              isFromEmail
              pageTitle=''
            />
          </ConseillerProvider>
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
      await userEvent.click(submitButton)

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
      await userEvent.click(submitButton)

      //THEN
      expect(result).toBeInTheDocument()
    })
    it("quand on recherche un nom composé d'une apostrophe", async () => {
      const result = screen.getByRole('row', {
        name: /D'Aböville-Muñoz François/i,
      })

      await userEvent.type(inputSearch, 'D aböville-Muñoz')

      //WHEN
      await userEvent.click(submitButton)

      //THEN
      expect(result).toBeInTheDocument()
    })
  })
})
