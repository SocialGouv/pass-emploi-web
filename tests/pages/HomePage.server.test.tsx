import { render } from '@testing-library/react'
import { redirect } from 'next/navigation'

import HomePage from 'app/(connected)/(with-sidebar)/(with-chat)/(index)/HomePage'
import Home from 'app/(connected)/(with-sidebar)/(with-chat)/(index)/page'
import { unConseiller } from 'fixtures/conseiller'
import {
  uneListeDAgencesMILO,
  uneListeDAgencesFranceTravail,
} from 'fixtures/referentiel'
import { Conseiller, StructureConseiller } from 'interfaces/conseiller'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getAgencesServerSide } from 'services/referentiel.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

jest.mock('utils/auth/auth', () => ({
  getMandatorySessionServerSide: jest.fn(),
}))
jest.mock('app/(connected)/(with-sidebar)/(with-chat)/(index)/HomePage')
jest.mock('services/conseiller.service')
jest.mock('services/referentiel.service')

describe('HomePage server side', () => {
  describe('si le conseiller a renseigné son agence et son mail', () => {
    beforeEach(() => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { id: '1' },
        accessToken: 'accessToken',
      })

      const conseillerAvecAgence: Conseiller = unConseiller({
        structureMilo: { nom: 'MLS3F SAINT-LOUIS', id: 'id-agence' },
        email: 'pass.emploi@beta.gouv.fr',
        structure: StructureConseiller.MILO,
      })
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(
        conseillerAvecAgence
      )
    })

    it('redirige vers le portefeuille', async () => {
      // When
      const promise = Home({})

      //Then
      await expect(promise).rejects.toEqual(
        new Error('NEXT REDIRECT /mes-jeunes')
      )
      expect(redirect).toHaveBeenCalledWith('/mes-jeunes')
    })

    it('redirige vers l’url renseignée', async () => {
      // When
      const promise = Home({
        searchParams: Promise.resolve({ redirectUrl: '/agenda' }),
      })

      //Then
      await expect(promise).rejects.toEqual(new Error('NEXT REDIRECT /agenda'))
      expect(redirect).toHaveBeenCalledWith('/agenda')
    })
  })

  describe('si le conseiller Milo n’a pas renseigné sa structure', () => {
    it('prépare la page pour renseigner sa structure', async () => {
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({})

      const conseiller = unConseiller({
        structure: StructureConseiller.MILO,
        email: 'pass.emploi@beta.gouv.fr',
      })
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(conseiller)

      // When
      render(await Home({}))

      // Then
      expect(HomePage).toHaveBeenCalledWith(
        {
          afficherModaleAgence: true,
          afficherModaleEmail: false,
          afficherModaleOnboarding: false,
          redirectUrl: '/mes-jeunes',
        },
        {}
      )
    })
  })

  describe('si le conseiller France Travail n’a pas renseigné son agence', () => {
    it('prépare la page pour renseigner son agence', async () => {
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({})

      const conseiller = unConseiller({
        structure: StructureConseiller.POLE_EMPLOI,
        email: 'pass.emploi@beta.gouv.fr',
      })
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(conseiller)
      ;(getAgencesServerSide as jest.Mock).mockResolvedValue(
        uneListeDAgencesFranceTravail()
      )

      // When
      render(
        await Home({
          searchParams: Promise.resolve({ redirectUrl: '/agenda' }),
        })
      )

      // Then
      expect(HomePage).toHaveBeenCalledWith(
        {
          afficherModaleAgence: true,
          afficherModaleEmail: false,
          afficherModaleOnboarding: false,
          redirectUrl: '/agenda',
          referentielAgences: uneListeDAgencesFranceTravail(),
        },
        {}
      )
    })
  })

  describe('si le conseiller n’a pas renseigné son adresse email', () => {
    it('prépare la page pour renseigner son adresse email', async () => {
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({})

      const conseiller = unConseiller({
        agence: { nom: 'MLS3F SAINT-LOUIS', id: 'id-agence' },
        structureMilo: {
          nom: 'Mission Locale Aubenas',
          id: 'id-test',
        },
        structure: StructureConseiller.MILO,
        email: undefined,
      })

      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(conseiller)

      // When
      render(await Home({}))

      // Then
      expect(HomePage).toHaveBeenCalledWith(
        {
          afficherModaleAgence: false,
          afficherModaleEmail: true,
          afficherModaleOnboarding: false,
          redirectUrl: '/mes-jeunes',
          referentielAgences: undefined,
        },
        {}
      )
    })
  })

  describe('si c’est un nouveau conseiller', () => {
    it('prépare la page avec l’onboarding', async () => {
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({})
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(
        unConseiller({ structure: StructureConseiller.POLE_EMPLOI })
      )
      ;(getAgencesServerSide as jest.Mock).mockResolvedValue(
        uneListeDAgencesFranceTravail()
      )

      // When
      render(
        await Home({
          searchParams: Promise.resolve({
            onboarding: true,
            redirectUrl: '/agenda',
          }),
        })
      )

      // Then
      expect(HomePage).toHaveBeenCalledWith(
        {
          afficherModaleAgence: true,
          afficherModaleEmail: false,
          afficherModaleOnboarding: true,
          redirectUrl: '/agenda',
          referentielAgences: uneListeDAgencesFranceTravail(),
        },
        {}
      )
    })
  })

  describe('si le conseiller doit signer la dernière version des CGU', () => {
    it('redirige vers la signature des CGUs', async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({})

      const conseiller: Conseiller = unConseiller({
        dateSignatureCGU: '1970-01-01',
      })
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(conseiller)
      ;(getAgencesServerSide as jest.Mock).mockResolvedValue(
        uneListeDAgencesMILO()
      )

      // When
      const promise = Home({})

      //Then
      await expect(promise).rejects.toEqual(
        new Error('NEXT REDIRECT /consentement-cgu')
      )
      expect(redirect).toHaveBeenCalledWith('/consentement-cgu')
    })
  })
})
