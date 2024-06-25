import { render } from '@testing-library/react'
import { Metadata } from 'next'

import HistoriquePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/informations/InformationsPage'
import Informations, {
  generateMetadata,
} from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/informations/page'
import {
  desConseillersBeneficiaire,
  unDetailBeneficiaire,
} from 'fixtures/beneficiaire'
import { CategorieSituation, EtatSituation } from 'interfaces/beneficiaire'
import {
  getConseillersDuJeuneServerSide,
  getJeuneDetails,
} from 'services/jeunes.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

jest.mock('utils/auth/auth', () => ({
  getMandatorySessionServerSide: jest.fn(),
}))
jest.mock('services/jeunes.service')
jest.mock(
  'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/informations/InformationsPage'
)

describe('HistoriquePage server side', () => {
  const listeSituations = [
    {
      etat: EtatSituation.EN_COURS,
      categorie: CategorieSituation.EMPLOI,
    },
    {
      etat: EtatSituation.PREVU,
      categorie: CategorieSituation.CONTRAT_EN_ALTERNANCE,
    },
  ]
  const listeConseillers = desConseillersBeneficiaire()

  let metadata: Metadata
  beforeEach(async () => {
    // Given
    ;(getJeuneDetails as jest.Mock).mockResolvedValue(
      unDetailBeneficiaire({
        id: 'id-beneficiaire',
        situations: listeSituations,
      })
    )
    ;(getConseillersDuJeuneServerSide as jest.Mock).mockResolvedValue(
      listeConseillers
    )
    ;(getMandatorySessionServerSide as jest.Mock).mockReturnValue({
      accessToken: 'accessToken',
      user: { id: 'id-conseiller' },
    })

    // When
    const params = { idJeune: 'id-beneficiaire' }
    metadata = await generateMetadata({ params })
    render(await Informations({ params }))
  })

  it('prépare la page', async () => {
    //Given
    let DetailJeune = unDetailBeneficiaire({
      id: 'id-beneficiaire',
      situations: listeSituations,
    })
    // Then
    expect(metadata).toEqual({
      title: 'Informations - Jirac Kenji - Portefeuille',
    })

    expect(getJeuneDetails).toHaveBeenCalledWith(
      'id-beneficiaire',
      'accessToken'
    )
    expect(getConseillersDuJeuneServerSide).toHaveBeenCalledWith(
      'id-beneficiaire',
      'accessToken'
    )
    expect(HistoriquePage).toHaveBeenCalledWith(
      {
        idBeneficiaire: 'id-beneficiaire',
        lectureSeule: false,
        situations: listeSituations,
        conseillers: listeConseillers,
        jeune: DetailJeune,
        onglet: 'INFORMATIONS',
      },
      {}
    )
  })
})
