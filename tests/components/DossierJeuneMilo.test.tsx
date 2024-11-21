import { act, screen } from '@testing-library/react'
import React from 'react'

import DossierBeneficiaireMilo from 'components/jeune/DossierBeneficiaireMilo'
import { unDossierMilo } from 'fixtures/milo'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

describe('<DossierMilo', () => {
  describe("quand l'e-mail du bénéficiaire est renseigné", () => {
    beforeEach(async () => {
      //GIVEN
      const dossier = unDossierMilo()

      //WHEN
      await act(async () => {
        renderWithContexts(
          <DossierBeneficiaireMilo
            dossier={dossier}
            beneficiaireExisteDejaMilo={false}
            erreurMessageCreationCompte=''
            onCreateCompte={jest.fn()}
            onAnnulationCreerCompte={jest.fn()}
            onRefresh={jest.fn()}
            onRetour={jest.fn()}
          />
        )
      })
    })

    it("affiche les informations d'un dossier bénéficiaire avec e-mail", () => {
      //THEN
      expect(getByDescriptionTerm('Prénom :')).toHaveTextContent('Kenji')
      expect(getByDescriptionTerm('Nom :')).toHaveTextContent('GIRAC')
      expect(getByDescriptionTerm('Date de naissance :')).toHaveTextContent(
        '1997-12-17'
      )
      expect(getByDescriptionTerm('Code postal :')).toHaveTextContent('13000')
      expect(getByDescriptionTerm('E-mail :')).toHaveTextContent(
        'kenji-faux-mail@mail.com'
      )
    })

    it("affiche le mode opératoire d'activation du compte", () => {
      // Then
      expect(
        screen.getByText(/lien d’activation valable 24h/)
      ).toBeInTheDocument()
    })
  })

  describe("quand l'e-mail du bénéficiaire n'est pas renseigné", () => {
    beforeEach(async () => {
      //GIVEN
      const dossier = unDossierMilo({ email: undefined })

      //WHEN
      await act(async () => {
        renderWithContexts(
          <DossierBeneficiaireMilo
            dossier={dossier}
            erreurMessageCreationCompte=''
            beneficiaireExisteDejaMilo={false}
            onCreateCompte={jest.fn()}
            onAnnulationCreerCompte={jest.fn()}
            onRefresh={jest.fn()}
            onRetour={jest.fn()}
          />
        )
      })
    })

    it('le champ e-mail doit être vide', () => {
      //THEN
      expect(getByDescriptionTerm('E-mail :')).toBeEmptyDOMElement()
    })

    it("affiche un message d'erreur", () => {
      //THEN
      expect(
        screen.getByText(
          "L'e-mail du bénéficiaire n'est peut-être pas renseigné"
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          "1. Renseignez l'e-mail du bénéficiaire sur son profil i-milo"
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          '2. Rafraîchissez ensuite cette page ou saisissez à nouveau le numéro de dossier du bénéficiaire pour créer le compte application CEJ'
        )
      ).toBeInTheDocument()
    })

    it("n'affiche pas le mode opératoire d'activation du compte", () => {
      // Then
      expect(() => screen.getByText(/lien d'activation valable 24h/)).toThrow()
    })
  })
})
