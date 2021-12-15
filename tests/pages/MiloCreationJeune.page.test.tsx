import { act, fireEvent, screen } from '@testing-library/react'
import renderWithSession from '../renderWithSession'
import Router from 'next/router'
import MiloCreationJeune from 'pages/mes-jeunes/milo-creation-jeune'
import userEvent from '@testing-library/user-event'

jest.mock('next/router')

describe('MiloCreationJeune', () => {
  describe('devrait rediriger', () => {
    it('devrait rediriger vers la page des informations du dossier jeune lorsque le numéro dossier est valide', () => {
      //GIVEN
      renderWithSession(<MiloCreationJeune />)

      const submitButton = screen.getByRole('button', {
        name: 'Valider le numéro',
      })

      const routerSpy = jest.spyOn(Router, 'push')

      //WHEN
      fireEvent.click(submitButton)

      //THEN
      expect(routerSpy).toHaveBeenCalledWith(
        '/mes-jeunes/milo-creation-jeune/1'
      )
    })
  })
  describe('devrait être invalide', () => {
    it('quand le compte existe déjà', async () => {
      //GIVEN
      const submitButton = () =>
        screen.getByRole('button', {
          name: 'Valider le numéro',
        })

      const messageErreur = screen.getByText(
        'Un compte existe déjà avec ce numéro'
      )

      //WHEN
      userEvent.type(
        screen.getByLabelText('Numéro dossier'),
        '{selectAll}{backspace}1'
      )
      await act(async () => {
        userEvent.click(submitButton())
      })

      //THEN
      expect(messageErreur).toBeInTheDocument()
    })
  })
})
