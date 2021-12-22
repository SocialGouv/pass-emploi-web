import React from 'react'
import { screen } from '@testing-library/react'
import { DossierMilo } from 'interfaces/jeune'
import { unDossierMilo } from 'fixtures/milo'
import getByDefinitionTerm from '../querySelector'
import DossierJeuneMilo from 'components/jeune/DossierJeuneMilo'
import renderWithSession from '../renderWithSession'

describe('<DossierMilo', () => {
  let dossier: DossierMilo
  describe("quand l'e-mail du jeune est renseigné", () => {
    it("devrait afficher les informations d'un dossier jeune avec e-mail", () => {
      //GIVEN
      dossier = unDossierMilo()

      //WHEN
      renderWithSession(
        <DossierJeuneMilo
          dossier={dossier}
          onCreatedSuccess={jest.fn()}
          onCreatedError={jest.fn()}
          erreurMessageHttpPassEmploi=''
        />
      )

      //THEN
      expect(getByDefinitionTerm('Prénom')).toHaveTextContent('Kenji')
      expect(getByDefinitionTerm('Nom')).toHaveTextContent('GIRAC')
      expect(getByDefinitionTerm('Date de naissance')).toHaveTextContent(
        '1997-12-17'
      )
      expect(getByDefinitionTerm('Code postal')).toHaveTextContent('13000')
      expect(getByDefinitionTerm('E-mail')).toHaveTextContent(
        'kenji-faux-mail@mail.com'
      )
    })
  })
  describe("quand l'e-mail du jeune n'est pas renseigné", () => {
    it('le champ e-mail doit être vide', () => {
      //GIVEN
      dossier = unDossierMilo({ email: undefined })

      //WHEN
      renderWithSession(
        <DossierJeuneMilo
          dossier={dossier}
          onCreatedSuccess={jest.fn()}
          onCreatedError={jest.fn()}
          erreurMessageHttpPassEmploi=''
        />
      )

      //THEN
      expect(getByDefinitionTerm('E-mail')).toBeEmptyDOMElement()
    })

    it("devrait afficher un message d'erreur", () => {
      //GIVEN
      dossier = unDossierMilo({ email: '' })

      //WHEN
      renderWithSession(
        <DossierJeuneMilo
          dossier={dossier}
          onCreatedSuccess={jest.fn()}
          onCreatedError={jest.fn()}
          erreurMessageHttpPassEmploi=''
        />
      )

      //THEN
      expect(
        screen.getByText("L'e-mail du jeune n'est peut-être pas renseigné")
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          "1. Renseignez l'e-mail du jeune sur son profil i-Milo"
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          '2. Rafraîchissez ensuite cette page ou saisissez à nouveau le numéro de dossier du jeune pour créer le compte Pass emploi'
        )
      ).toBeInTheDocument()
    })
  })
})
