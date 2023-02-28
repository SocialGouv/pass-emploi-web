import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { uneBaseJeune } from 'fixtures/jeune'
import { mockedJeunesService } from 'fixtures/services'
import MissionLocale, { getServerSideProps } from 'pages/etablissement'
import { JeunesService } from 'services/jeunes.service'
import renderWithContexts from 'tests/renderWithContexts'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

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
