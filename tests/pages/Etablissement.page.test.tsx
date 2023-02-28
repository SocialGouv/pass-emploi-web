import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { uneBaseJeune } from 'fixtures/jeune'
import { uneListeDAgencesMILO } from 'fixtures/referentiel'
import {
  mockedConseillerService,
  mockedJeunesService,
  mockedReferentielService,
} from 'fixtures/services'
import { StructureConseiller } from 'interfaces/conseiller'
import { Agence } from 'interfaces/referentiel'
import MissionLocale, { getServerSideProps } from 'pages/etablissement'
import Etablissement from 'pages/etablissement'
import { ConseillerService } from 'services/conseiller.service'
import { JeunesService } from 'services/jeunes.service'
import { ReferentielService } from 'services/referentiel.service'
import renderWithContexts from 'tests/renderWithContexts'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')
jest.mock('components/Modal')

describe('Etablissement', () => {
  describe('Client side', () => {
    let jeunesService: JeunesService
    const unJeune = uneBaseJeune()
    beforeEach(async () => {
      jeunesService = mockedJeunesService({
        rechercheJeunesDeLEtablissement: jest.fn(async () => [unJeune]),
      })
      renderWithContexts(<MissionLocale pageTitle='' />, {
        customDependances: { jeunesService },
        customConseiller: {
          agence: { nom: 'Mission Locale Aubenas', id: 'id-etablissement' },
        },
      })
    })

    it('affiche un champ de recherche', () => {
      // Then
      expect(
        screen.getByLabelText(
          /Rechercher un bénéficiaire par son nom ou prénom/
        )
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', {
          name: 'Rechercher',
        })
      ).toBeInTheDocument()
    })

    it('lance une recherche parmis les jeunes de la Mission Locale', async () => {
      // Given
      const inputRechercheJeune = screen.getByLabelText(
        /Rechercher un bénéficiaire par son nom ou prénom/
      )
      const buttonRechercheJeune = screen.getByRole('button', {
        name: 'Rechercher',
      })

      // When
      await userEvent.type(inputRechercheJeune, 'a')
      await userEvent.click(buttonRechercheJeune)

      // Then
      expect(
        jeunesService.rechercheJeunesDeLEtablissement
      ).toHaveBeenCalledWith('id-etablissement', 'a')
    })

    it('affiche le resultat de la recherche dans un tableau', async () => {
      // Given
      const inputRechercheJeune = screen.getByLabelText(
        /Rechercher un bénéficiaire par son nom ou prénom/
      )
      const buttonRechercheJeune = screen.getByRole('button', {
        name: 'Rechercher',
      })

      // When
      await userEvent.type(inputRechercheJeune, 'a')
      await userEvent.click(buttonRechercheJeune)
      const tableauDeJeunes = screen.getByRole('table', {
        name: 'Résultat de recherche (1)',
      })

      // Then
      expect(tableauDeJeunes).toBeInTheDocument()
      expect(
        within(tableauDeJeunes).getByRole('columnheader', {
          name: 'Bénéficiaire',
        })
      ).toBeInTheDocument()
      expect(
        within(tableauDeJeunes).getByText(`${unJeune.nom} ${unJeune.prenom}`)
      ).toBeInTheDocument()
    })

    it('affiche le resultat de la recherche dans un tableau', async () => {
      // Given
      const inputRechercheJeune = screen.getByLabelText(
        /Rechercher un bénéficiaire par son nom ou prénom/
      )
      const buttonRechercheJeune = screen.getByRole('button', {
        name: 'Rechercher',
      })

      ;(
        jeunesService.rechercheJeunesDeLEtablissement as jest.Mock
      ).mockResolvedValue([])

      // When
      await userEvent.type(inputRechercheJeune, 'z')
      await userEvent.click(buttonRechercheJeune)

      // Then
      expect(
        screen.getByText('Aucune bénéficiaire ne correspond à votre recherche.')
      ).toBeInTheDocument()
    })

    describe('quand le conseiller n’a pas d’établissement', () => {
      let agences: Agence[]
      let referentielService: ReferentielService
      let conseillerService: ConseillerService

      beforeEach(async () => {
        agences = uneListeDAgencesMILO()
        referentielService = mockedReferentielService({
          getAgencesClientSide: jest.fn(async () => agences),
        })

        conseillerService = mockedConseillerService()

        // When
        await act(async () => {
          await renderWithContexts(<Etablissement pageTitle='' />, {
            customDependances: {
              referentielService,
              conseillerService,
            },
            customConseiller: { structure: StructureConseiller.MILO },
          })
        })
      })

      it('n’affiche pas le champs de recherche', async () => {
        // Then
        expect(
          screen.queryByRole('search', {
            name: 'Rechercher un bénéficiaire par son nom ou prénom',
          })
        ).not.toBeInTheDocument()
      })

      it('demande de renseigner son agence', async () => {
        // Then
        expect(
          screen.getByText(/Votre Mission Locale n’est pas renseignée/)
        ).toBeInTheDocument()

        expect(
          screen.getByRole('button', {
            name: 'Renseigner votre Mission Locale',
          })
        ).toBeInTheDocument()
      })

      it('permet de renseigner son agence', async () => {
        // When
        await userEvent.click(
          screen.getByRole('button', {
            name: 'Renseigner votre Mission Locale',
          })
        )

        // Then
        expect(referentielService.getAgencesClientSide).toHaveBeenCalledWith(
          StructureConseiller.MILO
        )
        expect(
          screen.getByRole('combobox', { name: /votre Mission Locale/ })
        ).toBeInTheDocument()
        agences.forEach((agence) =>
          expect(
            screen.getByRole('option', { hidden: true, name: agence.nom })
          ).toBeInTheDocument()
        )
      })

      it('sauvegarde l’agence et affiche la liste des animations collectives de l’agence', async () => {
        // Given
        await userEvent.click(
          screen.getByRole('button', {
            name: 'Renseigner votre Mission Locale',
          })
        )
        const agence = agences[2]
        const searchAgence = screen.getByRole('combobox', {
          name: /votre Mission Locale/,
        })
        const submit = screen.getByRole('button', { name: 'Ajouter' })

        // When
        await userEvent.selectOptions(searchAgence, agence.nom)
        await userEvent.click(submit)

        // Then
        expect(conseillerService.modifierAgence).toHaveBeenCalledWith({
          id: agence.id,
          nom: agence.nom,
          codeDepartement: '3',
        })
        expect(() =>
          screen.getByText('Votre Mission Locale n’est pas renseignée')
        ).toThrow()
      })
    })
  })

  describe('Server side', () => {
    it('requiert une session valide', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: false,
        redirect: { destination: 'whatever' },
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
      expect(actual).toEqual({ redirect: { destination: 'whatever' } })
    })

    describe('quand le conseiller est Pole emploi', () => {
      it('renvoie une 404', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { structure: 'POLE_EMPLOI' },
          },
        })

        // When
        const actual = await getServerSideProps({} as GetServerSidePropsContext)

        // Then
        expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
        expect(actual).toEqual({ notFound: true })
      })
    })

    describe('quand le conseiller est connecté', () => {
      it('prépare la page en tant que Pass Emploi', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { structure: 'PASS_EMPLOI' },
          },
        })
        // When
        const actual = await getServerSideProps({} as GetServerSidePropsContext)

        // Then

        expect(actual).toEqual({
          props: {
            pageTitle: 'Agence',
          },
        })
      })

      it('prépare la page en tant que MILO', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { structure: 'MILO' },
          },
        })
        // When
        const actual = await getServerSideProps({} as GetServerSidePropsContext)

        // Then

        expect(actual).toEqual({
          props: {
            pageTitle: 'Mission Locale',
          },
        })
      })
    })
  })
})
