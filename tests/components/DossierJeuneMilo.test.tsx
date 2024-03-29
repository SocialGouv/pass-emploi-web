import { act, screen } from '@testing-library/react'
import React from 'react'

import DossierJeuneMilo from 'components/jeune/DossierJeuneMilo'
import { unDossierMilo } from 'fixtures/milo'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

describe('<DossierMilo', () => {
  describe("quand l'e-mail du jeune est renseigné", () => {
    beforeEach(async () => {
      //GIVEN
      const dossier = unDossierMilo()

      //WHEN
      await act(async () => {
        renderWithContexts(
          <DossierJeuneMilo
            dossier={dossier}
            onCreateCompte={jest.fn()}
            erreurMessageHttpPassEmploi=''
          />
        )
      })
    })

    it("affiche les informations d'un dossier jeune avec e-mail", () => {
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

  describe("quand l'e-mail du jeune n'est pas renseigné", () => {
    beforeEach(async () => {
      //GIVEN
      const dossier = unDossierMilo({ email: undefined })

      //WHEN
      await act(async () => {
        renderWithContexts(
          <DossierJeuneMilo
            dossier={dossier}
            onCreateCompte={jest.fn()}
            erreurMessageHttpPassEmploi=''
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
        screen.getByText("L'e-mail du jeune n'est peut-être pas renseigné")
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          "1. Renseignez l'e-mail du jeune sur son profil i-milo"
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          '2. Rafraîchissez ensuite cette page ou saisissez à nouveau le numéro de dossier du jeune pour créer le compte application CEJ'
        )
      ).toBeInTheDocument()
    })

    it("n'affiche pas le mode opératoire d'activation du compte", () => {
      // Then
      expect(() => screen.getByText(/lien d'activation valable 24h/)).toThrow()
    })
  })
})
