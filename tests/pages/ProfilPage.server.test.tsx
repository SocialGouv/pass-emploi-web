import { render } from '@testing-library/react'
import { getServerSession } from 'next-auth'

import Profil from 'app/(connected)/(with-sidebar)/(with-chat)/profil/page'
import ProfilPage from 'app/(connected)/(with-sidebar)/(with-chat)/profil/ProfilPage'
import { unUtilisateur } from 'fixtures/auth'
import { unConseiller } from 'fixtures/conseiller'
import { uneListeDAgencesMILO } from 'fixtures/referentiel'
import { Conseiller, StructureConseiller } from 'interfaces/conseiller'
import { getConseillerServerSide } from 'services/conseillers.service'
import { getAgencesServerSide } from 'services/referentiel.service'

jest.mock('app/(connected)/(with-sidebar)/(with-chat)/profil/ProfilPage')
jest.mock('services/conseillers.service')
jest.mock('services/referentiel.service')

describe('ProfilPage server side', () => {
  describe('en tant que France Travail', () => {
    it('charge la page avec les bonnes props', async () => {
      // Given
      const conseiller = unConseiller({
        structure: StructureConseiller.POLE_EMPLOI,
      })

      // When
      await renderPageForConseiller(conseiller)

      // Then
      expect(getAgencesServerSide).not.toHaveBeenCalled()
      expect(ProfilPage).toHaveBeenCalledWith({ referentielAgences: [] }, {})
    })
  })

  describe('en tant que Mission Locale avec une agence déjà renseignée ', () => {
    it('charge la page avec les bonnes props sans le référentiel d’agences', async () => {
      // Given
      const conseiller = unConseiller({
        structure: StructureConseiller.MILO,
        agence: { nom: 'MLS3F SAINT-LOUIS' },
      })

      // When
      await renderPageForConseiller(conseiller)

      // Then
      expect(ProfilPage).toHaveBeenCalledWith({ referentielAgences: [] }, {})
    })
  })

  describe('en tant que Mission Locale sans agence déjà renseignée ', () => {
    it('charge la page avec les bonnes props avec le référentiel d’agences', async () => {
      // Given
      const conseiller = unConseiller({ structure: StructureConseiller.MILO })

      // When
      await renderPageForConseiller(conseiller)

      // Then
      expect(ProfilPage).toHaveBeenCalledWith(
        { referentielAgences: uneListeDAgencesMILO() },
        {}
      )
    })
  })

  async function renderPageForConseiller(conseiller: Conseiller) {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: unUtilisateur({ structure: conseiller.structure }),
    })
    ;(getConseillerServerSide as jest.Mock).mockResolvedValue(conseiller)
    ;(getAgencesServerSide as jest.Mock).mockResolvedValue(
      uneListeDAgencesMILO()
    )

    render(await Profil())
  }
})
