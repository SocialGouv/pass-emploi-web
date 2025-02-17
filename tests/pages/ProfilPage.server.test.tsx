import { render } from '@testing-library/react'

import Profil from 'app/(connected)/(with-sidebar)/(with-chat)/profil/page'
import ProfilPage from 'app/(connected)/(with-sidebar)/(with-chat)/profil/ProfilPage'
import { unConseiller } from 'fixtures/conseiller'
import { uneListeDAgencesMILO } from 'fixtures/referentiel'
import { Conseiller } from 'interfaces/conseiller'
import { structureFTCej, structureMilo } from 'interfaces/structure'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getAgencesServerSide } from 'services/referentiel.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

jest.mock('utils/auth/auth', () => ({
  getMandatorySessionServerSide: jest.fn(),
}))
jest.mock('app/(connected)/(with-sidebar)/(with-chat)/profil/ProfilPage')
jest.mock('services/conseiller.service')
jest.mock('services/referentiel.service')

describe('ProfilPage server side', () => {
  describe('en tant que France Travail', () => {
    it('charge la page avec les bonnes props', async () => {
      // Given
      const conseiller = unConseiller({
        structure: structureFTCej,
      })

      // When
      await renderPageForConseiller(conseiller)

      // Then
      expect(getAgencesServerSide).not.toHaveBeenCalled()
      expect(ProfilPage).toHaveBeenCalledWith(
        { referentielMissionsLocales: [] },
        undefined
      )
    })
  })

  describe('en tant que Mission Locale avec une agence déjà renseignée ', () => {
    it('charge la page avec les bonnes props sans le référentiel d’agences', async () => {
      // Given
      const conseiller = unConseiller({
        structure: structureMilo,
        agence: { nom: 'MLS3F SAINT-LOUIS' },
      })

      // When
      await renderPageForConseiller(conseiller)

      // Then
      expect(ProfilPage).toHaveBeenCalledWith(
        { referentielMissionsLocales: [] },
        undefined
      )
    })
  })

  describe('en tant que Mission Locale sans agence déjà renseignée ', () => {
    it('charge la page avec les bonnes props avec le référentiel d’agences', async () => {
      // Given
      const conseiller = unConseiller({ structure: structureMilo })

      // When
      await renderPageForConseiller(conseiller)

      // Then
      expect(ProfilPage).toHaveBeenCalledWith(
        { referentielMissionsLocales: uneListeDAgencesMILO() },
        undefined
      )
    })
  })

  async function renderPageForConseiller(conseiller: Conseiller) {
    ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
      accessToken: 'accessToken',
      user: { id: 'id-conseiller', structure: conseiller.structure },
    })
    ;(getConseillerServerSide as jest.Mock).mockResolvedValue(conseiller)
    ;(getAgencesServerSide as jest.Mock).mockResolvedValue(
      uneListeDAgencesMILO()
    )

    render(await Profil())
  }
})
