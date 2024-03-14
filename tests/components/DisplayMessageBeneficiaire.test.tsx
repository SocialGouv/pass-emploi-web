import { act, screen } from '@testing-library/react'
import React from 'react'

import DisplayMessageBeneficiaire from 'components/chat/DisplayMessageBeneficiaire'
import { unConseiller } from 'fixtures/conseiller'
import { unMessage } from 'fixtures/message'
import { StructureConseiller } from 'interfaces/conseiller'
import renderWithContexts from 'tests/renderWithContexts'

describe('<DiplayMessageBeneficiaire />', () => {
  it('affiche un message envoyé par le bénéficiaire', async () => {
    const beneficiaireNomComplet = 'Père Castor'
    const conseiller = unConseiller({
      structure: StructureConseiller.MILO,
    })

    //Given
    const message = unMessage({
      sentBy: 'jeune',
      content: 'Je vais vous raconter une histoire',
    })

    //When
    await act(async () => {
      renderWithContexts(
        <DisplayMessageBeneficiaire
          message={message}
          beneficiaireNomComplet={beneficiaireNomComplet}
        />
      )
    })

    // Then
    expect(screen.getByText('Père Castor :')).toBeInTheDocument()
  })
})
