import { render } from '@testing-library/react'
import { headers } from 'next/headers'

import PartageRecherche from 'app/(connected)/(with-sidebar)/(without-chat)/offres/[typeOffre]/partage-recherche/page'
import PartageRecherchePage from 'app/(connected)/(with-sidebar)/(without-chat)/offres/[typeOffre]/partage-recherche/PartageRecherchePage'
import { TypeOffre } from 'interfaces/offre'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

jest.mock('utils/auth/auth', () => ({
  getMandatorySessionServerSide: jest.fn(),
}))
jest.mock(
  'app/(connected)/(with-sidebar)/(without-chat)/offres/[typeOffre]/partage-recherche/PartageRecherchePage'
)

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

  describe('quand l’utilisateur est connecté', () => {
    beforeEach(() => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { id: 'id-conseiller' },
        accessToken: 'accessToken',
      })
      ;(headers as jest.Mock).mockReturnValue(
        new Map([['referer', 'referer-url']])
      )
    })

    it('charge la page avec les détails de suggestion d’offre d’emploi', async () => {
      // When
      render(
        await PartageRecherche({
          params: Promise.resolve({ typeOffre: 'emploi' }),
          searchParams: Promise.resolve({
            titre: TITRE,
            motsCles: MOTS_CLES,
            typeLocalite: TYPE_LOCALITE,
            labelLocalite: LABEL_LOCALITE,
            codeLocalite: CODE_LOCALITE,
          }),
        })
      )

      // Then
      expect(PartageRecherchePage).toHaveBeenCalledWith(
        {
          type: TypeOffre.EMPLOI,
          criteresRecherche: {
            titre: TITRE,
            motsCles: MOTS_CLES,
            typeLocalite: TYPE_LOCALITE,
            labelLocalite: LABEL_LOCALITE,
            codeLocalite: CODE_LOCALITE,
          },
          returnTo: 'referer-url',
        },
        {}
      )
    })

    it('charge la page avec les détails de suggestion d’alternance', async () => {
      // When
      render(
        await PartageRecherche({
          params: Promise.resolve({ typeOffre: 'alternance' }),
          searchParams: Promise.resolve({
            titre: TITRE,
            motsCles: MOTS_CLES,
            typeLocalite: TYPE_LOCALITE,
            labelLocalite: LABEL_LOCALITE,
            codeLocalite: CODE_LOCALITE,
          }),
        })
      )

      // Then
      expect(PartageRecherchePage).toHaveBeenCalledWith(
        {
          type: TypeOffre.ALTERNANCE,
          criteresRecherche: {
            titre: TITRE,
            motsCles: MOTS_CLES,
            typeLocalite: TYPE_LOCALITE,
            labelLocalite: LABEL_LOCALITE,
            codeLocalite: CODE_LOCALITE,
          },
          returnTo: 'referer-url',
        },
        {}
      )
    })

    it('charge la page avec les détails de suggestion d’immersion', async () => {
      // When
      render(
        await PartageRecherche({
          params: Promise.resolve({ typeOffre: 'immersion' }),
          searchParams: Promise.resolve({
            titre: TITRE,
            labelMetier: LABEL_METIER,
            codeMetier: CODE_METIER,
            labelLocalite: LABEL_LOCALITE,
            latitude: LATITUDE,
            longitude: LONGITUDE,
          }),
        })
      )

      // Then
      expect(PartageRecherchePage).toHaveBeenCalledWith(
        {
          type: TypeOffre.IMMERSION,
          criteresRecherche: {
            titre: TITRE,
            labelMetier: LABEL_METIER,
            codeMetier: CODE_METIER,
            labelLocalite: LABEL_LOCALITE,
            latitude: LATITUDE,
            longitude: LONGITUDE,
          },
          returnTo: 'referer-url',
        },
        {}
      )
    })

    it('charge la page avec les détails de suggestion de service civique', async () => {
      // When
      render(
        await PartageRecherche({
          params: Promise.resolve({ typeOffre: 'service-civique' }),
          searchParams: Promise.resolve({
            titre: TITRE,
            labelLocalite: LABEL_LOCALITE,
            latitude: LATITUDE,
            longitude: LONGITUDE,
          }),
        })
      )

      // Then
      expect(PartageRecherchePage).toHaveBeenCalledWith(
        {
          type: TypeOffre.SERVICE_CIVIQUE,
          criteresRecherche: {
            titre: TITRE,
            labelLocalite: LABEL_LOCALITE,
            latitude: LATITUDE,
            longitude: LONGITUDE,
          },
          returnTo: 'referer-url',
        },
        {}
      )
    })
  })
})
