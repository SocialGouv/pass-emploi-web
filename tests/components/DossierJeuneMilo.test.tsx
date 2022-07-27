import { screen } from '@testing-library/react'
import React from 'react'

import DossierJeuneMilo from 'components/jeune/DossierJeuneMilo'
import { unDossierMilo } from 'fixtures/milo'
import { mockedConseillerService } from 'fixtures/services'
import { ConseillerService } from 'services/conseiller.service'
import getByDefinitionTerm from 'tests/querySelector'
import renderWithSession from 'tests/renderWithSession'
import { DIProvider } from 'utils/injectionDependances'

describe('<DossierMilo', () => {
  let conseillerService: ConseillerService

  beforeEach(() => {
    conseillerService = mockedConseillerService()
  })

  describe("quand l'e-mail du jeune est renseigné", () => {
    it("devrait afficher les informations d'un dossier jeune avec e-mail", () => {
      //GIVEN
      const dossier = unDossierMilo()

      //WHEN
      renderWithSession(
        <DIProvider dependances={{ conseillerService }}>
          <DossierJeuneMilo
            dossier={dossier}
            onCreatedSuccess={jest.fn()}
            onCreatedError={jest.fn()}
            erreurMessageHttpPassEmploi=''
          />
        </DIProvider>
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
      const dossier = unDossierMilo({ email: undefined })

      //WHEN
      renderWithSession(
        <DIProvider dependances={{ conseillerService }}>
          <DossierJeuneMilo
            dossier={dossier}
            onCreatedSuccess={jest.fn()}
            onCreatedError={jest.fn()}
            erreurMessageHttpPassEmploi=''
          />
        </DIProvider>
      )

      //THEN
      expect(getByDefinitionTerm('E-mail')).toBeEmptyDOMElement()
    })

    it("devrait afficher un message d'erreur", () => {
      //GIVEN
      const dossier = unDossierMilo({ email: '' })

      //WHEN
      renderWithSession(
        <DIProvider dependances={{ conseillerService }}>
          <DossierJeuneMilo
            dossier={dossier}
            onCreatedSuccess={jest.fn()}
            onCreatedError={jest.fn()}
            erreurMessageHttpPassEmploi=''
          />
        </DIProvider>
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
          '2. Rafraîchissez ensuite cette page ou saisissez à nouveau le numéro de dossier du jeune pour créer le compte application CEJ'
        )
      ).toBeInTheDocument()
    })
  })
})
