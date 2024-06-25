import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import React from 'react'

import PartageRecherchePage from 'app/(connected)/(with-sidebar)/(without-chat)/offres/[typeOffre]/partage-recherche/PartageRecherchePage'
import { TypeOffre } from 'interfaces/offre'
import { AlerteParam } from 'referentiel/alerteParam'
import {
  partagerRechercheAlternance,
  partagerRechercheImmersion,
  partagerRechercheOffreEmploi,
  partagerRechercheServiceCivique,
} from 'services/suggestions.service'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/suggestions.service')

describe('Partage Recherche', () => {
  const TITRE = 'Prof - Marseille 06'
  const MOTS_CLES = 'Prof'
  const LABEL_METIER = 'Professeur'
  const CODE_METIER = 'K2107'
  const LABEL_LOCALITE = 'Marseille 06'
  const TYPE_LOCALITE = 'COMMUNE'
  const CODE_LOCALITE = '13006'
  const LATITUDE = '43.365355'
  const LONGITUDE = '5.321875'

  let inputSearchBeneficiaire: HTMLSelectElement
  let submitButton: HTMLButtonElement

  let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
  let push: Function
  describe('pour tous les partages de recherche', () => {
    beforeEach(() => {
      alerteSetter = jest.fn()
      push = jest.fn(() => Promise.resolve())
      ;(useRouter as jest.Mock).mockReturnValue({ push })

      renderWithContexts(
        <PartageRecherchePage
          type={TypeOffre.EMPLOI}
          criteresRecherche={{
            titre: TITRE,
            motsCles: MOTS_CLES,
            typeLocalite: TYPE_LOCALITE,
            labelLocalite: LABEL_LOCALITE,
            codeLocalite: CODE_LOCALITE,
          }}
          returnTo='/return/to'
        />,
        {
          customAlerte: { alerteSetter },
        }
      )

      //Given
      inputSearchBeneficiaire = screen.getByRole('combobox', {
        name: /Destinataires/,
      })

      submitButton = screen.getByRole('button', {
        name: 'Envoyer',
      })
    })

    describe('quand le formulaire n’a pas encore été soumis', () => {
      it('devrait afficher les champs pour envoyer un message', () => {
        // Then
        expect(inputSearchBeneficiaire).toBeInTheDocument()
        expect(
          screen.getByRole('button', { name: 'Envoyer' })
        ).toBeInTheDocument()
        expect(
          screen.getByRole('link', { name: 'Annuler' })
        ).toBeInTheDocument()
      })

      it('ne valide pas le formulaire si aucun destinataires n’est sélectionné', async () => {
        //Given
        await userEvent.click(submitButton)

        // Then
        expect(inputSearchBeneficiaire.selectedOptions).toBe(undefined)
        expect(
          screen.getByText(/Le champ ”Destinataires” est vide./)
        ).toBeInTheDocument()
      })
    })

    describe('quand on remplit le formulaire', () => {
      beforeEach(async () => {
        // Given
        await userEvent.type(inputSearchBeneficiaire, 'Jirac Kenji')
        await userEvent.type(inputSearchBeneficiaire, 'Sanfamiye Nadia')
      })

      it('sélectionne plusieurs bénéficiaires dans la liste', () => {
        // Then
        expect(screen.getByText('Jirac Kenji')).toBeInTheDocument()
        expect(screen.getByText('Sanfamiye Nadia')).toBeInTheDocument()
        expect(screen.getByText('Destinataires (2)')).toBeInTheDocument()
      })

      it('redirige vers la page précédente', async () => {
        // When
        await userEvent.click(submitButton)

        // Then
        expect(alerteSetter).toHaveBeenCalledWith('suggestionRecherche')
        expect(push).toHaveBeenCalledWith('/offres')
      })
    })
  })

  describe('pour le partage de recherche d’un type d’offre particulier', () => {
    describe('Offre Emploi', () => {
      beforeEach(() => {
        // Given
        ;(useRouter as jest.Mock).mockReturnValue({ push: () => {} })
        renderWithContexts(
          <PartageRecherchePage
            type={TypeOffre.EMPLOI}
            criteresRecherche={{
              titre: TITRE,
              motsCles: MOTS_CLES,
              typeLocalite: TYPE_LOCALITE,
              labelLocalite: LABEL_LOCALITE,
              codeLocalite: CODE_LOCALITE,
            }}
            returnTo=''
          />
        )

        //Given
        inputSearchBeneficiaire = screen.getByRole('combobox', {
          name: /Destinataires/,
        })

        submitButton = screen.getByRole('button', {
          name: 'Envoyer',
        })
      })

      it('affiche les informations de la suggestion d’offre d’emploi', () => {
        expect(screen.getByText(TITRE)).toBeInTheDocument()
        expect(getByDescriptionTerm('Type')).toHaveTextContent('Offre d’emploi')
        expect(getByDescriptionTerm('Métier')).toHaveTextContent(MOTS_CLES)
        expect(getByDescriptionTerm('Localité')).toHaveTextContent(
          LABEL_LOCALITE
        )
      })

      it('envoie une suggestion d’offre d’emploi à plusieurs destinataires', async () => {
        // Given
        await userEvent.type(inputSearchBeneficiaire, 'Jirac Kenji')
        await userEvent.type(inputSearchBeneficiaire, 'Sanfamiye Nadia')

        // When
        await userEvent.click(submitButton)

        // Then
        expect(partagerRechercheOffreEmploi).toHaveBeenCalledWith({
          idsJeunes: ['beneficiaire-2', 'beneficiaire-1'],
          titre: TITRE,
          motsCles: MOTS_CLES,
          labelLocalite: LABEL_LOCALITE,
          codeCommune: CODE_LOCALITE,
        })
      })
    })

    describe('Alternance', () => {
      beforeEach(() => {
        // Given
        ;(useRouter as jest.Mock).mockReturnValue({ push: () => {} })
        renderWithContexts(
          <PartageRecherchePage
            type={TypeOffre.ALTERNANCE}
            criteresRecherche={{
              titre: TITRE,
              motsCles: MOTS_CLES,
              typeLocalite: TYPE_LOCALITE,
              labelLocalite: LABEL_LOCALITE,
              codeLocalite: CODE_LOCALITE,
            }}
            returnTo=''
          />
        )

        //Given
        inputSearchBeneficiaire = screen.getByRole('combobox', {
          name: /Destinataires/,
        })

        submitButton = screen.getByRole('button', {
          name: 'Envoyer',
        })
      })

      it('affiche les informations de la suggestion d’alternance', () => {
        expect(screen.getByText(TITRE)).toBeInTheDocument()
        expect(getByDescriptionTerm('Type')).toHaveTextContent('Alternance')
        expect(getByDescriptionTerm('Métier')).toHaveTextContent(MOTS_CLES)
        expect(getByDescriptionTerm('Localité')).toHaveTextContent(
          LABEL_LOCALITE
        )
      })

      it('envoie une suggestion d’alternance à plusieurs destinataires', async () => {
        // Given
        await userEvent.type(inputSearchBeneficiaire, 'Jirac Kenji')
        await userEvent.type(inputSearchBeneficiaire, 'Sanfamiye Nadia')

        // When
        await userEvent.click(submitButton)

        // Then
        expect(partagerRechercheAlternance).toHaveBeenCalledWith({
          idsJeunes: ['beneficiaire-2', 'beneficiaire-1'],
          titre: TITRE,
          motsCles: MOTS_CLES,
          labelLocalite: LABEL_LOCALITE,
          codeCommune: CODE_LOCALITE,
        })
      })
    })

    describe('Immersion', () => {
      beforeEach(() => {
        // Given
        ;(useRouter as jest.Mock).mockReturnValue({ push: () => {} })
        renderWithContexts(
          <PartageRecherchePage
            type={TypeOffre.IMMERSION}
            criteresRecherche={{
              titre: TITRE,
              labelMetier: LABEL_METIER,
              codeMetier: CODE_METIER,
              labelLocalite: LABEL_LOCALITE,
              latitude: LATITUDE,
              longitude: LONGITUDE,
            }}
            returnTo=''
          />
        )

        //Given
        inputSearchBeneficiaire = screen.getByRole('combobox', {
          name: /Destinataires/,
        })

        submitButton = screen.getByRole('button', {
          name: 'Envoyer',
        })
      })

      it('affiche les informations de la suggestion d’immersion', () => {
        expect(screen.getByText(TITRE)).toBeInTheDocument()
        expect(getByDescriptionTerm('Type')).toHaveTextContent('Immersion')
        expect(getByDescriptionTerm('Métier')).toHaveTextContent(MOTS_CLES)
        expect(getByDescriptionTerm('Localité')).toHaveTextContent(
          LABEL_LOCALITE
        )
      })

      it('envoie une suggestion d’immersion à plusieurs destinataires', async () => {
        // Given
        await userEvent.type(inputSearchBeneficiaire, 'Jirac Kenji')
        await userEvent.type(inputSearchBeneficiaire, 'Sanfamiye Nadia')

        // When
        await userEvent.click(submitButton)

        // Then
        expect(partagerRechercheImmersion).toHaveBeenCalledWith({
          idsJeunes: ['beneficiaire-2', 'beneficiaire-1'],
          titre: TITRE,
          labelMetier: LABEL_METIER,
          codeMetier: CODE_METIER,
          labelLocalite: LABEL_LOCALITE,
          latitude: Number(LATITUDE),
          longitude: Number(LONGITUDE),
        })
      })
    })

    describe('Service Civique', () => {
      beforeEach(() => {
        // Given
        ;(useRouter as jest.Mock).mockReturnValue({ push: () => {} })
        renderWithContexts(
          <PartageRecherchePage
            type={TypeOffre.SERVICE_CIVIQUE}
            criteresRecherche={{
              titre: TITRE,
              labelLocalite: LABEL_LOCALITE,
              latitude: LATITUDE,
              longitude: LONGITUDE,
            }}
            returnTo=''
          />
        )

        //Given
        inputSearchBeneficiaire = screen.getByRole('combobox', {
          name: /Destinataires/,
        })

        submitButton = screen.getByRole('button', {
          name: 'Envoyer',
        })
      })

      it('affiche les informations de la suggestion de service civique', () => {
        expect(screen.getByText(TITRE)).toBeInTheDocument()
        expect(getByDescriptionTerm('Type')).toHaveTextContent(
          'Service civique'
        )
        expect(getByDescriptionTerm('Localité')).toHaveTextContent(
          LABEL_LOCALITE
        )
      })

      it('envoie une suggestion de service civique à plusieurs destinataires', async () => {
        // Given
        await userEvent.type(inputSearchBeneficiaire, 'Jirac Kenji')
        await userEvent.type(inputSearchBeneficiaire, 'Sanfamiye Nadia')

        // When
        await userEvent.click(submitButton)

        // Then
        expect(partagerRechercheServiceCivique).toHaveBeenCalledWith({
          idsJeunes: ['beneficiaire-2', 'beneficiaire-1'],
          titre: TITRE,
          labelLocalite: LABEL_LOCALITE,
          latitude: Number(LATITUDE),
          longitude: Number(LONGITUDE),
        })
      })
    })
  })
})
