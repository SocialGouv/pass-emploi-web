import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GetServerSidePropsResult, Metadata } from 'next'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import HistoriquePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/historique/HistoriquePage'
import Historique, {
  generateMetadata,
} from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/historique/page'
import { desConseillersJeune, unDetailJeune } from 'fixtures/jeune'
import { StructureConseiller } from 'interfaces/conseiller'
import {
  CategorieSituation,
  ConseillerHistorique,
  EtatSituation,
} from 'interfaces/jeune'
import {
  getConseillersDuJeuneServerSide,
  getJeuneDetails,
} from 'services/jeunes.service'
import renderWithContexts from 'tests/renderWithContexts'
import { getMandatorySessionServerSide } from 'utils/auth/auth'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'
import DetailsJeune from '../../components/jeune/DetailsJeune'

jest.mock('utils/auth/auth', () => ({
  getMandatorySessionServerSide: jest.fn(),
}))
jest.mock('services/jeunes.service')
jest.mock(
  'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/historique/HistoriquePage'
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
  const listeConseillers = desConseillersJeune()

  let metadata: Metadata
  beforeEach(async () => {
    // Given
    ;(getJeuneDetails as jest.Mock).mockResolvedValue(
      unDetailJeune({ id: 'id-jeune', situations: listeSituations })
    )
    ;(getConseillersDuJeuneServerSide as jest.Mock).mockResolvedValue(
      listeConseillers
    )
    ;(getMandatorySessionServerSide as jest.Mock).mockReturnValue({
      accessToken: 'accessToken',
      user: { id: 'id-conseiller' },
    })

    // When
    const params = { idJeune: 'id-jeune' }
    metadata = await generateMetadata({ params })
    render(await Historique({ params }))
  })

  it('prépare la page', async () => {
    //Given
    let DetailJeune = unDetailJeune({
      id: 'id-jeune',
      situations: listeSituations,
    })
    // Then
    expect(metadata).toEqual({
      title: 'Historique - Jirac Kenji - Portefeuille',
    })

    expect(getJeuneDetails).toHaveBeenCalledWith('id-jeune', 'accessToken')
    expect(getConseillersDuJeuneServerSide).toHaveBeenCalledWith(
      'id-jeune',
      'accessToken'
    )
    expect(HistoriquePage).toHaveBeenCalledWith(
      {
        idJeune: 'id-jeune',
        lectureSeule: false,
        situations: listeSituations,
        conseillers: listeConseillers,
        jeune: DetailJeune,
      },
      {}
    )
  })
})
