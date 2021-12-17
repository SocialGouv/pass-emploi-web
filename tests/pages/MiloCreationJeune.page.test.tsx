import { fireEvent, screen } from '@testing-library/react'
import renderWithSession from '../renderWithSession'
import MiloCreationJeune from 'pages/mes-jeunes/milo/creation-jeune'

jest.mock('next/router')

describe('MiloCreationJeune', () => {
  describe("quand le dossier n'a pas encore été saisi", () => {
    beforeEach(() => {
      renderWithSession(
        <MiloCreationJeune dossierId='' dossier={null} errMessage='' />
      )
    })

    it('devrait afficher le champ de recherche de dossier', () => {
      //THEN
      expect(screen.getByText("Création d'un compte jeune")).toBeInTheDocument
      expect(
        screen.getByText(
          'Saisissez le numéro de dossier du jeune pour lequel vous voulez créer un compte'
        )
      ).toBeInTheDocument
      expect(screen.getByLabelText('Numéro de dossier')).toBeInTheDocument
    })

    it("quand on soumet la recherche avec une valeur vide, affiche un message d'erreur", () => {
      //GIVEN
      const submitButton = screen.getByRole('button', {
        name: 'Valider le numéro',
      })
      const inputSearch = screen.getByLabelText('Numéro de dossier')
      fireEvent.change(inputSearch, { target: { value: '' } })

      //WHEN
      fireEvent.click(submitButton)

      //THEN
      expect(screen.getByText('Veuillez remplir le champ')).toBeInTheDocument
    })
  })

  describe('quand le dossier a été saisi', () => {
    it("quand le dossier est invalide avec un message d'erreur", () => {
      //GIVEN
      const messageErreur = "un message d'erreur"
      renderWithSession(
        <MiloCreationJeune
          dossierId='1'
          dossier={null}
          errMessage={messageErreur}
        />
      )

      //THEN
      expect(screen.getByText(messageErreur)).toBeInTheDocument
    })
  })
})
