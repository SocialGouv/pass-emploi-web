import { screen } from '@testing-library/react'
import React from 'react'

import { StructureConseiller } from 'interfaces/conseiller'
import Favoris from 'pages/mes-jeunes/[jeune_id]/favoris'
import Messagerie, { getServerSideProps } from 'pages/messagerie'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('Messagerie', () => {
  describe('client side', () => {
    beforeEach(async () => {
      renderWithContexts(<Messagerie pageTitle='' />, {
        customConseiller: {
          structure: StructureConseiller.POLE_EMPLOI,
        },
      })
    })

    it('affiche un message de bienvenue au landing sur la page', async () => {
      //Then
      expect(
        screen.getByText('Bienvenue dans votre espace de messagerie.')
      ).toBeInTheDocument()
    })
  })
})
