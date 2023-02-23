import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { mockedJeunesService } from 'fixtures/services'
import MissionLocale, { getServerSideProps } from 'pages/mission-locale'
import { JeunesService } from 'services/jeunes.service'
import renderWithContexts from 'tests/renderWithContexts'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('Mission Locale', () => {
  describe('Client side', () => {
    let jeunesService: JeunesService
    const unJeune = {
      id: 'jeune-1',
      prenom: 'Kenji',
      nom: 'Jirac',
    }
    beforeEach(async () => {
      ;(useRouter as jest.Mock).mockReturnValue({ replace: jest.fn() })

      jeunesService = mockedJeunesService({
        rechercheJeunesDeLEtablissement: jest.fn(async () => [unJeune]),
      })
      renderWithContexts(<MissionLocale pageTitle='' />, {
        customDependances: { jeunesService },
        customConseiller: {
          agence: { nom: 'Mission locale Aubenas', id: 'id-etablissement' },
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

    it('lance une recherche parmis les jeunes de la mission locale', async () => {
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
      it('prépare la page', async () => {
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
