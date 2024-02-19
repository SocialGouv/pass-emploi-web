import { act, screen } from '@testing-library/react'
import React from 'react'

import DisplayMessage from 'components/chat/DisplayMessage'
import { unConseiller } from 'fixtures/conseiller'
import { unMessage } from 'fixtures/message'
import { StructureConseiller } from 'interfaces/conseiller'
import renderWithContexts from 'tests/renderWithContexts'

describe('<DiplayMessage />', () => {
  it('indique un message a été envoyé par le conseiller connecté', async () => {
    const nomConseiller = 'johnny boi'
    const nomBeneficiaire = 'Père Castor'
    const customConseiller = unConseiller({
      structure: StructureConseiller.MILO,
      firstName: 'johnny',
      lastName: 'boi',
      id: 'id-conseiller',
    })

    //Given
    const message = unMessage({
      sentBy: 'conseiller',
      content: 'coucou',
      conseillerId: customConseiller.id,
    })

    //When
    await act(async () => {
      renderWithContexts(
        <DisplayMessage
          message={message}
          beneficiaireNomComplet={nomBeneficiaire}
          conseillerNomComplet={nomConseiller}
          lastSeenByJeune={message.creationDate.plus({ day: 1 })}
          isConseillerCourant={message.conseillerId === customConseiller.id}
        />
      )
    })

    // Then
    expect(screen.getByText('Vous')).toBeInTheDocument()
  })

  it('indique un message a été envoyé par le bénéficiaire', async () => {
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
        <DisplayMessage
          message={message}
          beneficiaireNomComplet={beneficiaireNomComplet}
          conseillerNomComplet={conseiller.lastName}
          lastSeenByJeune={message.creationDate.plus({ day: 1 })}
          isConseillerCourant={message.conseillerId === conseiller.id}
        />
      )
    })

    // Then
    expect(screen.getByText('Père Castor :')).toBeInTheDocument()
  })
})
