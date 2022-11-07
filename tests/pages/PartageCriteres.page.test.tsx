import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import React from 'react'

import { desItemsJeunes } from 'fixtures/jeune'
import { uneCommune } from 'fixtures/referentiel'
import { mockedRecherchesSerivice } from 'fixtures/services'
import { TypeOffre } from 'interfaces/offre'
import PartageCritere from 'pages/offres/partage-critere'
import { SuggestionsService } from 'services/suggestions.service'
import renderWithContexts from 'tests/renderWithContexts'

describe('Partage Critères', () => {
  let recherchesService: SuggestionsService

  beforeEach(() => {
    recherchesService = mockedRecherchesSerivice()
  })

  describe('Type Offre Emploi', () => {
    describe('client side', () => {
      let inputSearchJeune: HTMLSelectElement
      let submitButton: HTMLButtonElement

      beforeEach(() => {
        renderWithContexts(
          <PartageCritere
            pageTitle='Partager une recherche'
            jeunes={desItemsJeunes()}
            type={TypeOffre.EMPLOI}
            criteresDeRecherche={{
              commune: uneCommune(),
              motsCles: '',
            }}
            withoutChat={true}
            returnTo=''
          />,
          { customDependances: { suggestionsService: recherchesService } }
        )

        //Given
        inputSearchJeune = screen.getByRole('combobox', {
          name: 'Rechercher et ajouter des jeunes Nom et prénom',
        })

        submitButton = screen.getByRole('button', {
          name: 'Envoyer',
        })
      })

      describe("quand le formulaire n'a pas encore été soumis", () => {
        it('devrait afficher les champs pour envoyer un message', () => {
          // Then
          expect(inputSearchJeune).toBeInTheDocument()
          expect(
            screen.getByRole('button', { name: 'Envoyer' })
          ).toBeInTheDocument()
          expect(
            screen.getByRole('link', { name: 'Annuler' })
          ).toBeInTheDocument()
        })

        it('ne devrait pas pouvoir cliquer sur le bouton envoyer sans avoir selectionner de bénéficiaire', async () => {
          // Then
          expect(inputSearchJeune.selectedOptions).toBe(undefined)
          expect(submitButton).toHaveAttribute('disabled')
        })
      })

      describe('quand on remplit le formulaire', () => {
        let push: Function
        beforeEach(async () => {
          push = jest.fn(() => Promise.resolve())
          ;(useRouter as jest.Mock).mockReturnValue({ push })

          // Given
          await userEvent.type(inputSearchJeune, 'Jirac Kenji')
          await userEvent.type(inputSearchJeune, 'Sanfamiye Nadia')
        })

        it('sélectionne plusieurs jeunes dans la liste', () => {
          // Then
          expect(screen.getByText('Jirac Kenji')).toBeInTheDocument()
          expect(screen.getByText('Sanfamiye Nadia')).toBeInTheDocument()
          expect(screen.getByText('Bénéficiaires (2)')).toBeInTheDocument()
        })

        it('envoi une recherche à plusieurs destinataires', async () => {
          // When
          await userEvent.click(submitButton)

          // Then
          // TODO appel du service POST/recherche
          // expect().toHaveBeenCalledWith(
          //   {
          //   }
          // )
        })

        it('redirige vers la page précédente', async () => {
          // When
          await userEvent.click(submitButton)

          // Then
          expect(push).toHaveBeenCalledWith({
            pathname: '/recherche-offres',
            query: { partageCriteres: 'succes' },
          })
        })
      })
    })
  })
})
